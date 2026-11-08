const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Neighbour = sequelize.define(
  "Neighbour",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Название соседнего государства",
    },
  },
  {
    tableName: "border_neighbours",
  },
);

module.exports = Neighbour;
