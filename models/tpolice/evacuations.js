const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Car = require("./cars");
const Room = require("./rooms");

const Evacuation = sequelize.define(
  "Evacuation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "cars", key: "number" },
      comment: "Эвакуированный автомобиль",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Причина эвакуации (например, парковка в неположенном месте)",
    },
    parkingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "rooms", key: "id" },
      comment: "На какую именно штрафстоянку доставлен автомобиль",
    },
    officerName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Имя инспектора, вызвавшего эвакуатор",
    },
  },
  {
    tableName: "evacuations",
  },
);

Evacuation.belongsTo(Car, { foreignKey: "carNumber", as: "vehicle" });
Evacuation.belongsTo(Room, { foreignKey: "parkingId", as: "parkingLot" });

module.exports = Evacuation;
