const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const CourtWorker = sequelize.define(
  "CourtWorker",
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
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Номер государственной лицензии судьи или адвоката",
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Судебный квалификационный класс или ранг",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Должность: judge или court_clerk",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер счета для перечисления заработной платы",
    },
  },
  {
    tableName: "court_workers",
  },
);

CourtWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = CourtWorker;
