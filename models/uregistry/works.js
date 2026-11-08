const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Work = sequelize.define(
  "Work",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Название предприятия или государственного ведомства",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Фактический адрес организации",
    },
  },
  {
    tableName: "works",
  },
);

module.exports = Work;
