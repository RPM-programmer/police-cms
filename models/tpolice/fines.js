const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Car = require("./cars");

const Fine = sequelize.define(
  "Fine",
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
      comment: "Связь с автомобилем из реестра",
    },
    ouwner: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ФИО нарушителя / владельца",
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    violation: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Какое правило дорожного движения нарушено",
    },
    punishment_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Тип наказания: Штраф, Лишение прав, Арест авто",
    },
    punishment_value: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Сумма штрафа или срок лишения",
    },
    collaborator: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ФИО и жетон инспектора, оформившего протокол",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Не выплачен",
      comment: "Статус оплаты штрафа",
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Зона или сектор патрулирования, где зафиксировано нарушение",
    },
  },
  {
    tableName: "fines",
  },
);

Fine.belongsTo(Car, { foreignKey: "carNumber", as: "vehicle" });

module.exports = Fine;
