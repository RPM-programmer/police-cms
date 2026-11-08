const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Contract = sequelize.define(
  "Contract",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "UID владельца жилья или организации",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Адрес объекта, который подключается к пульту",
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Ежемесячная стоимость абонентской платы за охрану",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "На рассмотрении",
      comment: "Статусы: На рассмотрении, Активен, Расторгнут",
    },
  },
  {
    tableName: "guard_contracts",
  },
);

Contract.belongsTo(User, { foreignKey: "clientId", as: "client" });

module.exports = Contract;
