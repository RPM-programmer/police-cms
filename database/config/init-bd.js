const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

async function initDatabase() {
  const storagePath =
    process.env.POLICE_CMS_DB_STORAGE || path.join(process.cwd(), "data.db");

  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storagePath,
    logging: process.env.POLICE_CMS_DB_LOGGING === "true" ? console.log : false,
  });

  const db = { sequelize, Sequelize };

  // 1. Автоматическая загрузка всех моделей из подпапок database/models/*
  const modelsRoot = path.join(__dirname, "..", "models");

  if (fs.existsSync(modelsRoot)) {
    const folders = fs
      .readdirSync(modelsRoot, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const folder of folders) {
      const folderPath = path.join(modelsRoot, folder.name);
      const files = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of files) {
        const defineModel = require(path.join(folderPath, file));
        if (typeof defineModel === "function") {
          const model = defineModel(sequelize);
          db[model.name] = model;
        }
      }
    }
  }

  // 2. Вызов метода associate, если модель определяет собственные связи
  Object.values(db).forEach((model) => {
    if (model && typeof model.associate === "function") {
      model.associate(db);
    }
  });

  // 3. Проверка соединения и создание файла data.bd с таблицами
  await sequelize.authenticate();
  await sequelize.sync({ alter: process.env.POLICE_CMS_DB_ALTER === "true" });

  return db;
}

module.exports = initDatabase;
