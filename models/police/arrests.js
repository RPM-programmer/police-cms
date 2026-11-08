const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Arrest = sequelize.define(
  "Arrest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    detaineeId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Задержанный гражданин",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Основание для задержания",
    },
    timeIn: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Время водворения в камеру",
    },
    timeOut: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Время планируемого освобождения",
    },
    belongings: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Опись вещей, сданных на хранение в дежурную часть",
    },
  },
  {
    tableName: "police_arrests",
  },
);

Arrest.belongsTo(User, { foreignKey: "detaineeId", as: "detainee" });

module.exports = Arrest;
