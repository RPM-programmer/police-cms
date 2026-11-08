const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Car = sequelize.define(
  "Car",
  {
    number: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Государственный регистрационный знак автомобиля",
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ФИО владельца",
    },
    owner_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    owner_gmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "cars",
  },
);

module.exports = Car;
