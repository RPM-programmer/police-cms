require("dotenv").config();
const EventEmitter = require("events");
const initDatabase = require("./database/config/init-bd");
const setupServer = require("./server/server");

const DEFAULT_DEPARTMENTS = [
  {
    code: "police",
    name: "Милиция",
    aboutText:
      "Охрана общественного порядка, приём заявлений КУСП, розыск и следствие.",
    badgeColor:
      "linear-gradient(180deg, #1d4ed8 0%, #dc2626 55%, #f97316 100%)",
  },
  {
    code: "traffic_police",
    name: "ГАИ",
    aboutText:
      "Государственная автомобильная инспекция: регистрация ТС, выдача ВУ, штрафы и ДТП.",
    badgeColor: "linear-gradient(180deg, #0284c7 0%, #1e40af 100%)",
  },
  {
    code: "security",
    name: "Охрана",
    aboutText:
      "Департамент охраны: пультовая защита объектов, ГБР, лицензии на оружие и пропуска СКУД.",
    badgeColor:
      "linear-gradient(180deg, #1e3a8a 0%, #b91c1c 55%, #090d16 100%)",
  },
  {
    code: "border_guards",
    name: "Пограничная служба",
    aboutText:
      "Контроль государственной границы, таможенное декларирование, визы и стоп-листы.",
    badgeColor: "linear-gradient(180deg, #15803d 0%, #0369a1 100%)",
  },
  {
    code: "court",
    name: "Суд",
    aboutText:
      "Осуществление правосудия, выдача судебных ордеров и вынесение приговоров.",
    badgeColor: "linear-gradient(180deg, #7f1d1d 0%, #334155 100%)",
  },
  {
    code: "InspectionMinistry",
    name: "Инспекционное министерство",
    aboutText:
      "Регистрация и аудит компаний, лицензирование бизнеса, проверки и госзакупки.",
    badgeColor: "linear-gradient(180deg, #0ea5e9 0%, #eab308 100%)",
  },
  {
    code: "KGB",
    name: "КГБ",
    aboutText:
      "Комитет государственной безопасности: контрразведка, защита гостайны и спецконтроль.",
    badgeColor: "linear-gradient(180deg, #09090b 0%, #27272a 100%)",
  },
];

async function init(app) {
  if (!app || typeof app.use !== "function") {
    throw new Error(
      "[police-cms] Необходимо передать экземпляр Express: await policeCms(app)",
    );
  }

  const config = {
    basePath: "/police-cms",
    apiPrefix: "/api/police-cms",
    ui: process.env.POLICE_CMS_ENABLE_UI !== "false",
    security: {
      registrarPassword:
        process.env.POLICE_CMS_REGISTRAR_PASSWORD || "admin-registrar",
      sessionSecret:
        process.env.POLICE_CMS_SESSION_SECRET || "police-cms-session-secret",
      encryptionKey:
        process.env.POLICE_CMS_KGB_ENCRYPTION_KEY ||
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      cookieMaxAge: process.env.POLICE_CMS_COOKIE_MAX_AGE
        ? Number(process.env.POLICE_CMS_COOKIE_MAX_AGE)
        : 24 * 60 * 60 * 1000,
      secureCookie: process.env.POLICE_CMS_SECURE_COOKIE === "true",
    },
  };

  const events = new EventEmitter();

  // 1. Инициализация SQLite (data.bd) и всех моделей
  const db = await initDatabase();

  // 2. Первичное заполнение 7 ведомств (если таблица Departments пуста)
  if (db.Department) {
    for (const dept of DEFAULT_DEPARTMENTS) {
      await db.Department.findOrCreate({
        where: { code: dept.code },
        defaults: dept,
      });
    }
  }
  // 2.1 Автоматическое создание базовых званий и назначение Root-администратора (если указан POLICE_CMS_ROOT_UID)
  const rootUid = process.env.POLICE_CMS_ROOT_UID;
  if (rootUid && db.Citizen && db.Officer && db.DepartmentRank) {
    const rootCitizen = await db.Citizen.findOne({ where: { uid: rootUid } });
    if (rootCitizen) {
      const [kgbRank] = await db.DepartmentRank.findOrCreate({
        where: { departmentCode: "KGB", title: "Председатель КГБ" },
        defaults: { level: 10, permissions: ["*"] },
      });

      await db.Officer.findOrCreate({
        where: { citizenUid: rootUid, departmentCode: "KGB" },
        defaults: {
          badgeNumber: "KGB-0001",
          rankId: kgbRank.id,
          isChief: true,
          division: "Центральный аппарат",
          clearanceLevel: 1,
        },
      });
    }
  }

  // 3. Запуск API, cookie-сессий и статики public/
  await setupServer(app, { db, config, events });
}

module.exports = init;
