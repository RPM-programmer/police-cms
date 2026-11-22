const helmet = require("helmet");
const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

async function setupMiddlewares(app, { db, config }) {
  // 1. Заголовки безопасности и парсинг запросов
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 2. Хранилище Cookie-сессий внутри SQLite (data.bd -> таблица Sessions)
  const sessionStore = new SequelizeStore({
    db: db.sequelize,
    tableName: "Sessions",
    expiration: config.security.cookieMaxAge,
  });
  await sessionStore.sync();

  app.use(
    session({
      name: "police_cms.sid",
      secret: config.security.sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.security.secureCookie,
        sameSite: "lax",
        maxAge: config.security.cookieMaxAge,
      },
    }),
  );

  // 3. Ограничение частоты запросов к API
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Превышен лимит запросов к государственной системе",
    },
  });
  app.use(config.apiPrefix, limiter);

  // 4. Подгрузка текущего гражданина и его должности из Cookie-сессии
  app.use(async (req, res, next) => {
    req.currentUser = null;
    req.currentOfficer = null;

    if (!req.session || !req.session.uid) return next();

    try {
      const citizen = await db.Citizen.findOne({
        where: { uid: req.session.uid, status: "active" },
        attributes: { exclude: ["passwordHash"] },
      });

      if (!citizen) {
        req.session.destroy(() => {});
        return next();
      }

      req.currentUser = citizen;

      const officer = await db.Officer.findOne({
        where: { citizenUid: citizen.uid, isSuspended: false },
        include: db.DepartmentRank
          ? [{ model: db.DepartmentRank, as: "rank" }]
          : [],
      });

      if (officer) req.currentOfficer = officer;
      next();
    } catch (err) {
      next(err);
    }
  });

  // Хелперы-гарды для API и HTML-страниц
  return {
    requireChief(deptCode) {
      return (req, res, next) => {
        if (!req.currentUser || !req.currentOfficer) {
          return res
            .status(403)
            .json({
              success: false,
              error: "Требуется авторизация сотрудника",
            });
        }
        const isDeptChief =
          req.currentOfficer.departmentCode === deptCode &&
          Boolean(req.currentOfficer.isChief);
        const isKgbSupervisor =
          req.currentOfficer.departmentCode === "KGB" &&
          req.currentOfficer.clearanceLevel > 0 &&
          req.currentOfficer.clearanceLevel <= 2;

        if (!isDeptChief && !isKgbSupervisor) {
          return res
            .status(403)
            .json({
              success: false,
              error: "Доступ только для Начальника и КГБ",
            });
        }
        next();
      };
    },

    requireSpec(deptCode, specCode) {
      return (req, res, next) => {
        if (!req.currentUser || !req.currentOfficer) {
          return res
            .status(403)
            .json({ success: false, error: "Доступ только для сотрудников" });
        }
        const isKgbSupervisor =
          req.currentOfficer.departmentCode === "KGB" &&
          req.currentOfficer.clearanceLevel > 0 &&
          req.currentOfficer.clearanceLevel <= 2;

        if (isKgbSupervisor) return next();
        if (req.currentOfficer.departmentCode !== deptCode) {
          return res
            .status(403)
            .json({
              success: false,
              error: "Вы не числитесь в этом ведомстве",
            });
        }
        if (req.currentOfficer.isChief) return next();

        const specs = Array.isArray(req.currentOfficer.specializations)
          ? req.currentOfficer.specializations
          : [];
        if (!specs.includes(specCode)) {
          return res
            .status(403)
            .json({ success: false, error: `Нет допуска: ${specCode}` });
        }
        next();
      };
    },

    requireAuthApi(req, res, next) {
      if (!req.currentUser) {
        return res
          .status(401)
          .json({ success: false, error: "Требуется авторизация" });
      }
      next();
    },

    requireAuthPage(req, res, next) {
      if (!req.currentUser) {
        return res.redirect(`${config.basePath}/login`);
      }
      next();
    },

    requireOfficerApi(req, res, next) {
      if (!req.currentUser || !req.currentOfficer) {
        return res.status(403).json({
          success: false,
          error: "Доступ только для сотрудников ведомств",
        });
      }
      next();
    },

    requireDepartment(deptCode, minClearance = 0) {
      return (req, res, next) => {
        if (!req.currentUser || !req.currentOfficer) {
          return req.originalUrl.startsWith(config.apiPrefix)
            ? res.status(403).json({
                success: false,
                error: "Доступ только для сотрудников ведомств",
              })
            : res.redirect(`${config.basePath}/login`);
        }

        // КГБ с 1-й или 2-й формой допуска имеет надзорный доступ ко всем службам
        const isKgbSupervisor =
          req.currentOfficer.departmentCode === "KGB" &&
          req.currentOfficer.clearanceLevel > 0 &&
          req.currentOfficer.clearanceLevel <= 2;

        const hasDeptAccess =
          req.currentOfficer.departmentCode === deptCode || isKgbSupervisor;
        const hasClearance =
          minClearance === 0 ||
          (req.currentOfficer.clearanceLevel > 0 &&
            req.currentOfficer.clearanceLevel <= minClearance);

        if (!hasDeptAccess || !hasClearance) {
          return req.originalUrl.startsWith(config.apiPrefix)
            ? res.status(403).json({
                success: false,
                error: "Недостаточно прав или формы допуска",
              })
            : res.status(403).send("Доступ запрещён");
        }

        next();
      };
    },
  };
}

module.exports = setupMiddlewares;
