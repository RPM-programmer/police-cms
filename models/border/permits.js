const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Permit = sequelize.define(
  "Permit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
      comment: "UID проверяемого гражданина",
    },
    exitPermit: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Глобальное разрешение на выезд из страны (true — выезд открыт)",
    },
    blackListStatus: {
      type: DataTypes.STRING,
      defaultValue: "Отсутствует",
      comment: "Основание ограничения: Должник ГАИ, Под следствием, Розыск",
    },
    visaInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Данные визовых документов для иностранных граждан",
    },
  },
  {
    tableName: "border_permits",
  },
);

Permit.belongsTo(User, { foreignKey: "userId", as: "citizen" });

module.exports = Permit;
