const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const CourtHistory = sequelize.define(
  "CourtHistory",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Номер судебного дела",
    },
    plaintiff: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ФИО или организация истца (кто подал в суд)",
    },
    defendantId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Ответчик по делу (гражданин под судом)",
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Материалы дела, суть искового заявления или обвинения",
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Дата проведения слушания",
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Время начала судебного заседания",
    },
  },
  {
    tableName: "court_history",
  },
);

CourtHistory.belongsTo(User, { foreignKey: "defendantId", as: "defendant" });

module.exports = CourtHistory;
