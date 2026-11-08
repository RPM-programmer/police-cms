const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const PoliceWorker = sequelize.define(
  "PoliceWorker",
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
    badge: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Номер служебного удостоверения/жетона милиционера",
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Звание (сержант, лейтенант, майор)",
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Подразделение: ППС, Уголовный Розыск, Дежурная часть",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Системная должность: mil_officer, mil_detective, mil_boss",
    },
    weapon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Закрепленное табельное оружие (например, ПМ, АКС-74У)",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер счета для перевода зарплаты начальником",
    },
  },
  {
    tableName: "police_workers",
  },
);

PoliceWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = PoliceWorker;
