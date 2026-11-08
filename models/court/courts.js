const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Court = sequelize.define(
  "Court",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Уникальный ID судебного участка",
    },
    iname: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Полное наименование суда (например: Городской суд)",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Физический адрес здания суда",
    },
  },
  {
    tableName: "courts",
  },
);

module.exports = Court;
