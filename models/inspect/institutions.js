const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Institution = sequelize.define(
  "Institution",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Уникальный ID предприятия / объекта контроля",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Название организации",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Фактический адрес объекта",
    },
    ownerId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "UID владельца (директора) организации",
    },
  },
  {
    tableName: "inspect_institutions",
  },
);

Institution.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = Institution;
