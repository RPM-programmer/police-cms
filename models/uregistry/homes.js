const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Home = sequelize.define(
  "Home",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    house: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Назначение объекта (Жилой, Школа, Отдел ГАИ, Банк)",
    },
  },
  {
    tableName: "homes",
  },
);

module.exports = Home;
