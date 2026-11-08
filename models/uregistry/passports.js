const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Passport = sequelize.define(
  "Passport",
  {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "ID бланка паспорта",
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "UID владельца паспорта",
    },
    pid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Номер паспорта",
    },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    surname2: { type: DataTypes.STRING, allowNull: true },
    wasBorn: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    region: { type: DataTypes.STRING },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Ссылка на фотографию гражданина для ориентировок",
    },
    auth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Статус активации паспорта",
    },
  },
  {
    tableName: "passports",
  },
);

module.exports = Passport;
