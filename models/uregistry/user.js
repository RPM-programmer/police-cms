const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Уникальный UID гражданина",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    patronymic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    home: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Адрес прописки гражданина",
    },
    work: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Место работы (например: ГАИ, Милиция, КГБ)",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Служебная должность сотрудника органов",
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "гражданин",
      comment: "Системная роль: admin или гражданин",
    },
    passportId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "PID паспорта (выступает в роли пароля при входе)",
    },
  },
  {
    tableName: "users",
  },
);

module.exports = User;
