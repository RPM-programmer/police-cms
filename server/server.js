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

  // ================= 1. АВТОРИЗАЦИЯ И ПОЛЬЗОВАТЕЛИ =================
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
    res
      .status(400)
      .json({
        success: false,
        error: err.message || "Внутренняя ошибка сервера",
      });
  });
  app.use(config.apiPrefix, api);
  // ================= 10. ВЕБ-ИНТЕРФЕЙС (public/html, css, js) =================
  if (config.ui) {
    const publicDir = path.join(__dirname, "..", "public");
    const base = config.basePath;
    app.use(base, express.static(publicDir));
    app.get(base, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "index.html")),
    );
    app.get(`${base}/register`, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "register.html")),
    );
    app.get(`${base}/login`, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "login.html")),
    );
    app.get(`${base}/cabinet`, guards.requireAuthPage, (req, res) =>
      res.sendFile(path.join(publicDir, "html", "cabinet.html")),
    );
    const allowedDepts = [
      "police",
      "traffic_police",
      "security",
      "border_guards",
      "court",
      "InspectionMinistry",
      "KGB",
    ];
    // Публичный портал ведомства (информация, ссылки на сообщества, кнопка "На работу / Войти")
    app.get(`${base}/dept/:dept`, (req, res) => {
      if (!allowedDepts.includes(req.params.dept))
        return res.status(404).send("Служба не найдена");
      res.sendFile(
        path.join(
          publicDir,
          "html",
          "departments",
          req.params.dept,
          "home.html",
        ),
      );
    });
    // Закрытая рабочая панель ведомства
    app.get(`${base}/dept/:dept/work`, (req, res, next) => {
      if (!allowedDepts.includes(req.params.dept))
        return res.status(404).send("Служба не найдена");
      return guards.requireDepartment(req.params.dept)(req, res, () => {
        res.sendFile(
          path.join(
            publicDir,
            "html",
            "departments",
            req.params.dept,
            "panel.html",
          ),
        );
      });
    });
  }
  return { services };
}
module.exports = setupServer;
