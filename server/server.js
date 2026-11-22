const path = require("path");
const express = require("express");
const setupMiddlewares = require("./middleware/midleware");

const AuthService = require("../database/services/user/AuthService");
const UserService = require("../database/services/user/UserService");
const NewsService = require("../database/services/news/NewsService");
const PoliceService = require("../database/services/police/PoliceService");
const TrafficPoliceService = require("../database/services/traffic_police/TrafficPoliceService");
const SecurityService = require("../database/services/security/SecurityService");
const BorderGuardsService = require("../database/services/border_guards/BorderGuardsService");
const InspectionService = require("../database/services/InspectionMinistry/InspectionService");
const CourtService = require("../database/services/court/CourtService");
const KgbService = require("../database/services/KGB/KgbService");
const SPECIALIZATIONS = require("../database/config/specializations");

// Обёртка для асинхронных роутов
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

async function setupServer(app, { db, config, events }) {
  const guards = await setupMiddlewares(app, { db, config });

  // Инициализация всех сервисов
  const services = {
    auth: new AuthService({ db, events }),
    user: new UserService({ db, events }),
    news: new NewsService({ db, events }),
    police: new PoliceService({ db, events }),
    trafficPolice: new TrafficPoliceService({ db, events }),
    security: new SecurityService({ db, events }),
    borderGuards: new BorderGuardsService({ db, events }),
    inspection: new InspectionService({ db, events }),
    court: new CourtService({ db, events }),
    kgb: new KgbService({ db, events }),
  };

  const api = express.Router();
  // 1. Список специализаций ведомства (для чекбоксов Начальника)
  api.get(
    "/departments/:code/specializations",
    guards.requireOfficerApi,
    (req, res) => {
      res.json({ success: true, data: SPECIALIZATIONS[req.params.code] || [] });
    },
  );

  // 2. Увольнение сотрудника из ведомства
  api.delete(
    "/departments/:code/staff/:uid",
    (req, res, next) => guards.requireChief(req.params.code)(req, res, next),
    asyncHandler(async (req, res) => {
      const officer = await db.Officer.findOne({
        where: {
          departmentCode: req.params.code,
          citizenUid: req.params.uid,
          isSuspended: false,
        },
      });
      if (!officer)
        return res
          .status(404)
          .json({ success: false, error: "Сотрудник не найден" });
      if (officer.isChief)
        return res.status(400).json({
          success: false,
          error: "Нельзя уволить Начальника через этот метод",
        });

      await officer.update({ isSuspended: true, clearanceLevel: 0 });
      await db.AuditLog.create({
        actorUid: req.currentUser.uid,
        departmentCode: req.params.code,
        action: "OFFICER_FIRED",
        targetTable: "Officers",
        targetRecordId: officer.badgeNumber,
        afterData: { firedUid: req.params.uid },
      });

      res.json({
        success: true,
        message: `Сотрудник ${req.params.uid} уволен`,
      });
    }),
  );

  // 3. Статистика ведомства
  api.get(
    "/departments/:code/stats",
    (req, res, next) => guards.requireChief(req.params.code)(req, res, next),
    asyncHandler(async (req, res) => {
      const code = req.params.code;
      const safeCount = async (model, where = {}) => {
        if (!model) return 0;
        try {
          return await model.count({ where });
        } catch {
          return 0;
        }
      };

      const stats = {
        "Активный штат": await safeCount(db.Officer, {
          departmentCode: code,
          isSuspended: false,
        }),
        "Опубликовано сводок": await safeCount(db.News, {
          departmentCode: code,
        }),
      };

      if (code === "traffic_police") {
        stats["Зарегистрировано ТС"] = await safeCount(db.Vehicle);
        stats["Выдано ВУ"] = await safeCount(db.DriverLicense);
        stats["Выписано штрафов"] = await safeCount(db.TrafficFine);
        stats["Оформлено ДТП"] = await safeCount(db.TrafficAccident);
      } else if (code === "police") {
        stats["В розыске"] = await safeCount(db.WantedPerson, {
          status: "active",
        });
        stats["Уголовных дел"] = await safeCount(db.CriminalCase);
        stats["Задержанных в ИВС"] = await safeCount(db.DetentionRecord, {
          status: "detained",
        });
      } else if (code === "security") {
        stats["Охраняемых объектов"] = await safeCount(db.GuardedObject);
        stats["Лицензий на оружие"] = await safeCount(db.WeaponLicense);
      } else if (code === "border_guards") {
        stats["Пересечений КПП"] = await safeCount(db.BorderCrossing);
        stats["В стоп-листе"] = await safeCount(db.BorderBan, {
          isActive: true,
        });
      } else if (code === "InspectionMinistry") {
        stats["Заявок компаний"] = await safeCount(db.Company, {
          status: "pending",
        });
        stats["Активных компаний"] = await safeCount(db.Company, {
          status: "approved",
        });
      } else if (code === "court") {
        stats["Судебных дел"] = await safeCount(db.CourtCase);
        stats["Активных ордеров"] = await safeCount(db.CourtWarrant, {
          status: "approved",
        });
      } else if (code === "KGB") {
        stats["Секретных архивов"] = await safeCount(db.ClassifiedFile);
        stats["Объектов в ОРМ"] = await safeCount(db.SurveillanceTarget, {
          isActive: true,
        });
      }

      res.json({ success: true, data: stats });
    }),
  );

  // Список сотрудников ведомства
  api.get(
    "/departments/:code/staff",
    guards.requireOfficerApi,
    asyncHandler(async (req, res) => {
      const staff = await db.Officer.findAll({
        where: { departmentCode: req.params.code, isSuspended: false },
        include: [
          {
            model: db.Citizen,
            as: "citizen",
            attributes: ["uid", "firstName", "lastName", "middleName"],
          },
          { model: db.DepartmentRank, as: "rank" },
        ],
      });
      res.json({ success: true, data: staff });
    }),
  );

  // Приём сотрудника на службу и выдача допусков (Начальник или КГБ)
  api.post(
    "/departments/:code/hire",
    (req, res, next) => guards.requireChief(req.params.code)(req, res, next),
    asyncHandler(async (req, res) => {
      const code = req.params.code;
      const isChief = Boolean(req.body.isChief);
      const rankTitle = isChief
        ? "Начальник ведомства"
        : req.body.rankTitle || "Рядовой";

      const [rank] = await db.DepartmentRank.findOrCreate({
        where: { departmentCode: code, title: rankTitle },
        defaults: { level: isChief ? 10 : 1, permissions: [] },
      });

      const officer = await services.user.hireOfficer({
        targetUid: String(req.body.targetUid || "").trim(),
        departmentCode: code,
        rankId: rank.id,
        isChief,
        specializations: Array.isArray(req.body.specializations)
          ? req.body.specializations
          : [],
        clearanceLevel: Number(req.body.clearanceLevel) || 0,
        hiredByUid: req.currentUser.uid,
      });

      res.status(201).json({ success: true, data: officer });
    }),
  );

  // Обновление описания и ссылок на портале ведомства (home.html)
  api.post(
    "/departments/:code/portal",
    (req, res, next) => guards.requireChief(req.params.code)(req, res, next),
    asyncHandler(async (req, res) => {
      const dept = await db.Department.findOne({
        where: { code: req.params.code },
      });
      if (!dept)
        return res
          .status(404)
          .json({ success: false, error: "Ведомство не найдено" });

      await dept.update({
        aboutText: req.body.aboutText ?? dept.aboutText,
        socialLinks: req.body.socialLinks ?? dept.socialLinks,
      });
      res.json({ success: true, data: dept });
    }),
  );

  // 4. Вызов состава на работу (сигнал сбора)
  api.post(
    "/departments/:code/call-duty",
    (req, res, next) => guards.requireChief(req.params.code)(req, res, next),
    asyncHandler(async (req, res) => {
      const code = req.params.code;
      events.emit("dept:call_duty", {
        departmentCode: code,
        initiatedByUid: req.currentUser.uid,
        timestamp: new Date(),
      });

      await db.AuditLog.create({
        actorUid: req.currentUser.uid,
        departmentCode: code,
        action: "CALL_DUTY_ISSUED",
        targetTable: "Departments",
        targetRecordId: code,
      });

      res.json({
        success: true,
        message: `Сигнал сбора отправлен всему личному составу (${code})`,
      });
    }),
  );

  api.post(
    "/auth/register/citizen",
    asyncHandler(async (req, res) => {
      const result = await services.auth.registerCitizen(
        req.body,
        req.currentUser?.uid || null,
      );
      res.status(result.success ? 201 : 400).json(result);
    }),
  );

  api.post(
    "/auth/register/company",
    asyncHandler(async (req, res) => {
      const result = await services.auth.registerCompany(req.body);
      res.status(result.success ? 201 : 400).json(result);
    }),
  );

  api.post(
    "/auth/login",
    asyncHandler(async (req, res, next) => {
      const result = await services.auth.login(req.body);
      if (!result.success) return res.status(401).json(result);
      req.session.uid = result.user.uid;
      req.session.save((err) => (err ? next(err) : res.json(result)));
    }),
  );

  api.get("/auth/me", (req, res) => {
    res.json({
      success: true,
      authenticated: Boolean(req.currentUser),
      user: req.currentUser,
      officer: req.currentOfficer,
    });
  });

  api.post("/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("police_cms.sid");
      res.json({ success: true });
    });
  });

  api.get(
    "/user/dossier/:uid",
    guards.requireAuthApi,
    asyncHandler(async (req, res) => {
      const targetUid =
        req.params.uid === "me" ? req.currentUser.uid : req.params.uid;
      if (targetUid !== req.currentUser.uid && !req.currentOfficer) {
        return res
          .status(403)
          .json({ success: false, error: "Нельзя просматривать чужое досье" });
      }
      const dossier = await services.user.getCitizenDossier(targetUid);
      res.json({ success: true, data: dossier });
    }),
  );

  api.get(
    "/departments/:code/portal",
    asyncHandler(async (req, res) => {
      const portal = await services.user.getDepartmentPortal(req.params.code);
      if (!portal)
        return res
          .status(404)
          .json({ success: false, error: "Ведомство не найдено" });
      res.json({ success: true, data: portal });
    }),
  );

  // ================= 2. НОВОСТИ =================
  api.get(
    "/news",
    asyncHandler(async (req, res) => {
      const feed = await services.news.getFeed({
        limit: Number(req.query.limit) || 30,
        offset: Number(req.query.offset) || 0,
        departmentCode: req.query.dept || null,
      });
      res.json({ success: true, data: feed });
    }),
  );

  api.post(
    "/news",
    guards.requireOfficerApi,
    asyncHandler(async (req, res) => {
      const article = await services.news.publishNews({
        ...req.body,
        departmentCode: req.currentOfficer.departmentCode,
        authorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data: article });
    }),
  );

  // ================= 3. МИЛИЦИЯ (police) =================
  api.post(
    "/police/call102",
    asyncHandler(async (req, res) => {
      const call = await services.police.createEmergencyCall({
        ...req.body,
        callerUid: req.currentUser?.uid || null,
      });
      res.status(201).json({ success: true, data: call });
    }),
  );

  api.post(
    "/police/reports",
    guards.requireAuthApi,
    asyncHandler(async (req, res) => {
      const report = await services.police.registerCrimeReport({
        ...req.body,
        applicantUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data: report });
    }),
  );

  api.post(
    "/police/cases",
    guards.requireDepartment("police"),
    asyncHandler(async (req, res) => {
      const data = await services.police.openCriminalCase({
        ...req.body,
        investigatorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/police/wanted",
    guards.requireDepartment("police"),
    asyncHandler(async (req, res) => {
      const data = await services.police.declareWanted({
        ...req.body,
        initiatedByDept: req.currentOfficer.departmentCode,
        initiatorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/police/detain",
    guards.requireDepartment("police"),
    asyncHandler(async (req, res) => {
      const data = await services.police.detainCitizen({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  // ================= 4. ГАИ (traffic_police) =================
  api.get(
    "/traffic-police/vehicles/:query",
    guards.requireOfficerApi,
    asyncHandler(async (req, res) => {
      const vehicle = await services.trafficPolice.inspectVehicle(
        req.params.query,
      );
      res.json({ success: true, data: vehicle });
    }),
  );

  api.post(
    "/traffic-police/vehicles",
    guards.requireDepartment("traffic_police"),
    asyncHandler(async (req, res) => {
      const data = await services.trafficPolice.registerVehicle({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/traffic-police/licenses",
    guards.requireDepartment("traffic_police"),
    asyncHandler(async (req, res) => {
      const data = await services.trafficPolice.issueDriverLicense({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/traffic-police/fines",
    guards.requireDepartment("traffic_police"),
    asyncHandler(async (req, res) => {
      const data = await services.trafficPolice.issueFine({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/traffic-police/accidents",
    guards.requireDepartment("traffic_police"),
    asyncHandler(async (req, res) => {
      const data = await services.trafficPolice.registerAccident({
        ...req.body,
        inspectorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  // ================= 5. ОХРАНА (security) =================
  api.post(
    "/security/objects",
    guards.requireDepartment("security"),
    asyncHandler(async (req, res) => {
      const data = await services.security.registerGuardedObject({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/security/alarm",
    guards.requireAuthApi,
    asyncHandler(async (req, res) => {
      const data = await services.security.triggerAlarm(req.body);
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/security/weapon-licenses",
    guards.requireDepartment("security"),
    asyncHandler(async (req, res) => {
      const data = await services.security.issueWeaponLicense({
        ...req.body,
        issuedByUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/security/weapons",
    guards.requireDepartment("security"),
    asyncHandler(async (req, res) => {
      const data = await services.security.registerWeapon({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  // ================= 6. ПОГРАНИЧНАЯ СЛУЖБА (border_guards) =================
  api.post(
    "/border/crossing",
    guards.requireDepartment("border_guards"),
    asyncHandler(async (req, res) => {
      const data = await services.borderGuards.processBorderCrossing({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/border/bans",
    guards.requireDepartment("border_guards"),
    asyncHandler(async (req, res) => {
      const data = await services.borderGuards.addBorderBan({
        ...req.body,
        officerUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/border/permits",
    guards.requireDepartment("border_guards"),
    asyncHandler(async (req, res) => {
      const data = await services.borderGuards.issueMigrationPermit({
        ...req.body,
        issuedByUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  // ================= 7. СУД (court) =================
  api.post(
    "/court/cases",
    guards.requireAuthApi,
    asyncHandler(async (req, res) => {
      const data = await services.court.fileCourtCase({
        ...req.body,
        plaintiffId: req.body.plaintiffId || req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );

  api.post(
    "/court/warrants/request",
    guards.requireOfficerApi,
    asyncHandler(async (req, res) => {
      const data = await services.court.requestWarrant({
        ...req.body,
        requestedByDept: req.currentOfficer.departmentCode,
        requestedByUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );
  api.post(
    "/court/warrants/:warrantNumber/review",
    guards.requireDepartment("court"),
    asyncHandler(async (req, res) => {
      const data = await services.court.reviewWarrant({
        warrantNumber: req.params.warrantNumber,
        decision: req.body.decision,
        validHours: req.body.validHours,
        judgeUid: req.currentUser.uid,
      });
      res.json({ success: true, data });
    }),
  );
  api.post(
    "/court/verdicts",
    guards.requireDepartment("court"),
    asyncHandler(async (req, res) => {
      const data = await services.court.issueVerdict({
        ...req.body,
        judgeUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );
  // ================= 8. ИНСПЕКЦИОННОЕ МИНИСТЕРСТВО =================
  api.get(
    "/inspection/companies/pending",
    guards.requireDepartment("InspectionMinistry"),
    asyncHandler(async (req, res) => {
      const data = await services.inspection.getPendingCompanies();
      res.json({ success: true, data });
    }),
  );
  api.post(
    "/inspection/companies/:cid/review",
    guards.requireDepartment("InspectionMinistry"),
    asyncHandler(async (req, res) => {
      const data = await services.inspection.reviewCompanyRegistration({
        cid: req.params.cid,
        ...req.body,
        inspectorUid: req.currentUser.uid,
      });
      res.json({ success: true, data });
    }),
  );
  api.post(
    "/inspection/checks",
    guards.requireDepartment("InspectionMinistry"),
    asyncHandler(async (req, res) => {
      const data = await services.inspection.recordInspection({
        ...req.body,
        inspectorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );
  // ================= 9. КГБ (KGB) =================
  api.post(
    "/kgb/classified",
    guards.requireDepartment("KGB", 3),
    asyncHandler(async (req, res) => {
      const data = await services.kgb.createClassifiedFile({
        ...req.body,
        curatorUid: req.currentUser.uid,
      });
      res.status(201).json({ success: true, data });
    }),
  );
  api.get(
    "/kgb/classified/:fileCode",
    guards.requireDepartment("KGB", 3),
    asyncHandler(async (req, res) => {
      const data = await services.kgb.readClassifiedFile({
        fileCode: req.params.fileCode,
        officer: req.currentOfficer,
      });
      res.json({ success: true, data });
    }),
  );
  api.post(
    "/kgb/suspend-officer",
    guards.requireDepartment("KGB", 2),
    asyncHandler(async (req, res) => {
      const data = await services.kgb.suspendOfficer({
        ...req.body,
        kgbOfficerUid: req.currentUser.uid,
      });
      res.json({ success: true, data });
    }),
  );
  api.get(
    "/kgb/audit-logs",
    guards.requireDepartment("KGB", 2),
    asyncHandler(async (req, res) => {
      const data = await services.kgb.getGlobalAuditLogs({
        limit: Number(req.query.limit) || 100,
        departmentCode: req.query.dept || null,
      });
      res.json({ success: true, data });
    }),
  );
  api.post(
    "/kgb/system-state",
    guards.requireDepartment("KGB", 1),
    asyncHandler(async (req, res) => {
      const data = await services.kgb.setSystemState({
        ...req.body,
        activatedByUid: req.currentUser.uid,
      });
      res.json({ success: true, data });
    }),
  );
  // Централизованный обработчик ошибок API
  api.use((err, req, res, next) => {
    res.status(400).json({
      success: false,
      error: err.message || "Внутренняя ошибка сервера",
    });
  });
  app.use(config.apiPrefix, api);
  // ================= 10. ВЕБ-ИНТЕРФЕЙС (Default Deny для public/) =================
  if (config.ui) {
    const publicDir = path.join(__dirname, "..", "public");
    const base = config.basePath;
    const allowedDepts = [
      "police",
      "traffic_police",
      "security",
      "border_guards",
      "court",
      "InspectionMinistry",
      "KGB",
    ];

    // 1. Статика (css, js, logo)
    app.use(`${base}/css`, express.static(path.join(publicDir, "css")));
    app.use(`${base}/js`, express.static(path.join(publicDir, "js")));
    app.use(`${base}/logo`, express.static(path.join(publicDir, "logo")));

    // 2. Открытые публичные страницы (с верхним навбаром)
    app.get(base, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "home", "home.html")),
    );
    app.get(`${base}/dept/:dept`, (req, res) => {
      if (!allowedDepts.includes(req.params.dept))
        return res.status(404).send("Служба не найдена");
      res.sendFile(path.join(publicDir, "html", req.params.dept, "home.html"));
    });

    // Открытые страницы авторизации/регистрации (без навбара)
    app.get(`${base}/login`, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "auth", "login.html")),
    );
    app.get(`${base}/register`, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "auth", "register.html")),
    );

    // 3. Защищённые cookie-сессией страницы (без навбара)
    app.get(`${base}/cabinet`, guards.requireAuthPage, (req, res) => {
      res.sendFile(path.join(publicDir, "html", "auth", "cabinet.html"));
    });

    // Единая рабочая панель ведомства (адаптируется под Рядового / Начальника / КГБ)
    app.get(`${base}/dept/:dept/work`, (req, res, next) => {
      if (!allowedDepts.includes(req.params.dept))
        return res.status(404).send("Служба не найдена");
      return guards.requireDepartment(req.params.dept)(req, res, () => {
        res.sendFile(
          path.join(publicDir, "html", req.params.dept, "work.html"),
        );
      });
    });

    // 4. Default Deny: блокировка прямого доступа ко всем остальным HTML в public/
    app.use(base, guards.requireAuthPage, express.static(publicDir));
  }

  return { services };
}
module.exports = setupServer;
