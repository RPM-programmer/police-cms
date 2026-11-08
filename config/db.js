const { Sequelize } = require("sequelize");
const path = require("path");

// Инициализируем подключение к SQLite в корне проекта
const sequelize = new Sequelize({
  dialect: "sqlite",
  // Файл gov_system.db будет автоматически создан в корневой директории
  storage: path.join(__dirname, "../gov_system.db"),
  logging: false, // Отключаем логирование SQL-запросов, чтобы консоль была чистой
  define: {
    timestamps: true, // Автоматически добавляет поля createdAt и updatedAt для каждой записи
    underscored: true, // Преобразует camelCase в snake_case для названий колонок в БД (например, user_id)
  },
});

module.exports = sequelize;
