const express = require("express");
const trafficPolice = express.Router();
const sequrity = express.Router();
const inspect = express.Router();
const court = express.Router();
const border = express.Router();
const user = express.Router();

const jsonParser = express.json();

const checkAuth = require("./middleware/checkAuth");
const requireRole = require("./middleware/requireRole");
const User = require("../models/uregistry/user");
const Services = require("../services");

trafficPolice.post("/api/auth/login", jsonParser, async (req, res) => {
  try {
    const { userId, password } = req.body;
    const citizen = await User.findByPk(userId);

    if (!citizen || citizen.passportId !== password) {
      return res.status(401).json({
        success: false,
        message: "Ошибка доступа: Неверный UID или PID паспорта!",
      });
    }

    res.json({
      success: true,
      message: "Авторизация успешно пройдена",
      userId: citizen.id,
      work: citizen.work,
      name: `${citizen.name} ${citizen.surname}`,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Ошибка сервера при авторизации" });
  }
});

trafficPolice.get("/api/bank/status", async (req, res) => {
  const available = process.env.SEQUELIZE_GAME_BANK_INIT === "true";
  res.json({
    success: true,
    available,
    message: available
      ? "Связь с банком установлена"
      : "Оплата картой недоступна. Пожалуйста, оплатите штраф лично.",
  });
});

trafficPolice.get("/api/fines/my", checkAuth, async (req, res) => {
  await Services.tpolice.getMyFines(req, res);
});

trafficPolice.post(
  "/api/fines/pay",
  checkAuth,
  jsonParser,
  async (req, res) => {
    await Services.tpolice.payFine(req, res);
  },
);

trafficPolice.post(
  "/api/fines/add",
  checkAuth,
  requireRole(["gai_officer", "gai_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.tpolice.addFine(req, res);
  },
);

trafficPolice.post(
  "/api/boss/pay-salary",
  checkAuth,
  requireRole(["gai_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.tpolice.bossPaySalary(req, res);
  },
);

trafficPolice.post(
  "/api/boss/hire",
  checkAuth,
  requireRole(["gai_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.tpolice.hireWorker(req, res);
  },
);

trafficPolice.post(
  "/api/boss/fire",
  checkAuth,
  requireRole(["gai_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.tpolice.fireWorker(req, res);
  },
);

trafficPolice.get("/api/cars/info/:carNumber", checkAuth, async (req, res) => {
  await Services.tpolice.getCarOwner(req, res);
});

border.post(
  "/api/boss/hire",
  checkAuth,
  requireRole(["border_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.border.hireWorker(req, res);
  },
);

border.post(
  "/api/boss/fire",
  checkAuth,
  requireRole(["border_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.border.fireWorker(req, res);
  },
);

border.post(
  "/api/control/check",
  checkAuth,
  requireRole(["border_officer", "border_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.border.registerPass(req, res);
  },
);

border.get(
  "/api/demographics",
  checkAuth,
  requireRole(["admin", "border_boss"]),
  async (req, res) => {
    await Services.border.getCountryDemographics(req, res);
  },
);

border.get("/api/neighbours", checkAuth, async (req, res) => {
  const Neighbour = require("../models/border/neighbours");
  const list = await Neighbour.findAll();
  res.json({ success: true, list });
});

court.post(
  "/api/boss/hire",
  checkAuth,
  requireRole(["admin"]),
  jsonParser,
  async (req, res) => {
    await Services.court.hireWorker(req, res);
  },
);

court.post(
  "/api/boss/fire",
  checkAuth,
  requireRole(["admin"]),
  jsonParser,
  async (req, res) => {
    await Services.court.fireWorker(req, res);
  },
);

court.get("/api/history", checkAuth, async (req, res) => {
  await Services.court.getHistory(req, res);
});

court.post(
  "/api/cases/create",
  checkAuth,
  requireRole(["judge", "court_clerk"]),
  jsonParser,
  async (req, res) => {
    await Services.court.createCase(req, res);
  },
);

court.post(
  "/api/solution/add",
  checkAuth,
  requireRole(["judge"]),
  jsonParser,
  async (req, res) => {
    await Services.court.addSolution(req, res);
  },
);

sequrity.post(
  "/api/boss/hire",
  checkAuth,
  requireRole(["kgb_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.sequrity.hireWorker(req, res);
  },
);

sequrity.post(
  "/api/boss/fire",
  checkAuth,
  requireRole(["admin"]),
  jsonParser,
  async (req, res) => {
    await Services.sequrity.fireWorker(req, res);
  },
);

sequrity.get(
  "/api/affairs/:id",
  checkAuth,
  requireRole(["kgb_agent", "kgb_boss"]),
  async (req, res) => {
    await Services.sequrity.getAffairDetails(req, res);
  },
);

sequrity.post(
  "/api/affairs/open",
  checkAuth,
  requireRole(["kgb_agent", "kgb_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.sequrity.openAffair(req, res);
  },
);

sequrity.post(
  "/api/suspects/add",
  checkAuth,
  requireRole(["kgb_agent", "kgb_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.sequrity.addSuspect(req, res);
  },
);

inspect.post(
  "/api/boss/hire",
  checkAuth,
  requireRole(["inspector_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.inspect.hireWorker(req, res);
  },
);

inspect.post(
  "/api/boss/fire",
  checkAuth,
  requireRole(["inspector_boss"]),
  jsonParser,
  async (req, res) => {
    await Services.inspect.fireWorker(req, res);
  },
);

inspect.get(
  "/api/institutions/pending",
  checkAuth,
  requireRole(["inspector", "inspector_boss"]),
  async (req, res) => {
    await Services.inspect.getPendingInstitutions(req, res);
  },
);

inspect.post(
  "/api/checks/add",
  checkAuth,
  requireRole(["inspector"]),
  jsonParser,
  async (req, res) => {
    await Services.inspect.addCheck(req, res);
  },
);

user.post(
  "/api/registry/create",
  checkAuth,
  requireRole(["admin"]),
  jsonParser,
  async (req, res) => {
    await Services.uregistry.createCitizen(req, res);
  },
);

user.delete(
  "/api/registry/kill/:uid",
  checkAuth,
  requireRole(["admin"]),
  async (req, res) => {
    await Services.uregistry.killCitizen(req, res);
  },
);

user.patch(
  "/api/registry/residency",
  checkAuth,
  requireRole(["admin"]),
  jsonParser,
  async (req, res) => {
    await Services.uregistry.updateResidency(req, res);
  },
);

user.get(
  "/api/registry/users",
  checkAuth,
  requireRole(["admin"]),
  async (req, res) => {
    await Services.uregistry.getAllUsers(req, res);
  },
);

user.get("/api/registry/quick/:uid", checkAuth, async (req, res) => {
  await Services.uregistry.getQuickProfile(req, res);
});

module.exports = { trafficPolice, sequrity, inspect, court, border, user };
