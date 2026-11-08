const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Orientation = sequelize.define(
  "Orientation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    targetUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "UID разыскиваемого (нужен для линковки к его фото в паспорте)",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "За какие преступления или подозрения объявлен в розыск",
    },
    dangerLevel: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Уровень опасности: Низкий, Средний, Особо опасен",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "В розыске",
      comment: "Статус: В розыске, Поймана/Задержан",
    },
  },
  {
    tableName: "police_orientations",
  },
);

Orientation.belongsTo(User, {
  foreignKey: "targetUserId",
  as: "wantedCitizen",
});

module.exports = Orientation;
