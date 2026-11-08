const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Migration = sequelize.define(
  "Migration",
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
      comment: "UID лица, пересекающего границу",
    },
    passportId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "PID паспорта на момент контроля",
    },
    direction: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Направление движения: Въезд или Выезд",
    },
    timestamp: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Точная дата и время прохождения КПП",
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Официальная цель визита/выезда",
    },
  },
  {
    tableName: "migration_registry",
  },
);

Migration.belongsTo(User, { foreignKey: "userId", as: "citizen" });

module.exports = Migration;
