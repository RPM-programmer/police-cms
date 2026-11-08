const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const KGBWorker = sequelize.define(
  "KGBWorker",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Связь с гражданином из Единого Регистра",
    },
    callsign: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Засекреченный оперативный позывной агента",
    },
    clearanceLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Уровень допуска к секретной информации (1-5)",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Системная должность: kgb_agent или kgb_boss",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер расчетного счета для начисления оклада",
    },
  },
  {
    tableName: "kgb_workers",
  },
);

KGBWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = KGBWorker;
