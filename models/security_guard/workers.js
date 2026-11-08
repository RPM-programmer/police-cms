const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const GuardWorker = sequelize.define(
  "GuardWorker",
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
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Номер служебной лицензии на охранную деятельность",
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Квалификационный разряд или звание сотрудника",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Системная должность: guard_officer или guard_boss",
    },
    assignedPost: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Охраняемый пост или маршрут патрулирования",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер счета для выплаты зарплаты",
    },
  },
  {
    tableName: "guard_workers",
  },
);

GuardWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = GuardWorker;
