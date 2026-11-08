const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Название (например: Центральное УГАИ, Штрафстоянка №1)",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "rooms",
  },
);

module.exports = Room;
