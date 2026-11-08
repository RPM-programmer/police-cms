const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const TPoliceWorker = sequelize.define(
  "TPoliceWorker",
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
      comment: "Связь с Единым Регистром Граждан",
    },
    badgeNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Личный номер жетона сотрудника ГАИ",
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Звание (рядовой, лейтенант, капитан и т.д.)",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Должность: gai_officer или gai_boss",
    },
    patrolCar: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Госномер закрепленного служебного авто",
    },
    patrolZone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Назначенная зона или пост патрулирования",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Расчетный счет сотрудника в банке для зарплаты",
    },
  },
  {
    tableName: "tpolice_workers",
  },
);

// Устанавливаем связь с таблицей пользователей
TPoliceWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = TPoliceWorker;
