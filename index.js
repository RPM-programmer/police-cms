require("dotenv").config();
const EventEmitter = require("events");
const initDatabase = require("./database/config/init-bd");
const setupServer = require("./server/server");

async function init(app) {
  if (!app || typeof app.use !== "function") {
    throw new Error(
      "[police-cms] Необходимо передать экземпляр Express: await policeCms(app)",
    );
  }

  const config = {
    basePath: process.env.POLICE_CMS_BASE_PATH || "/police-cms",
    apiPrefix: process.env.POLICE_CMS_API_PREFIX || "/api/police-cms",
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
  const db = await initDatabase();
  await setupServer(app, { db, config, events });
}

module.exports = init;
