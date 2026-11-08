const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Contract = require("./contracts");

const GuardObject = sequelize.define(
  "GuardObject",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "guard_contracts", key: "id" },
      comment: "Связь с активным договором на охрану",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alarmSystemStatus: {
      type: DataTypes.STRING,
      defaultValue: "Снято с охраны",
      comment: "Состояние: Снято с охраны, На охране",
    },
  },
  {
    tableName: "guard_objects",
  },
);

GuardObject.belongsTo(Contract, { foreignKey: "contractId", as: "contract" });

module.exports = GuardObject;
