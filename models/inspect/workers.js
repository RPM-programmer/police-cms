const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const InspectWorker = sequelize.define(
  "InspectWorker",
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
    license: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Номер служебного удостоверения государственного инспектора",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Сфера надзора: Пожарный, Санитарный, Налоговый, Строительный",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Системная должность: inspector или inspector_boss",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер расчетного счета для выплаты зарплаты",
    },
  },
  {
    tableName: "inspect_workers",
  },
);

InspectWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = InspectWorker;
