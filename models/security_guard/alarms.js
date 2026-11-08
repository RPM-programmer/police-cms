const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const GuardObject = require("./objects");

const Alarm = sequelize.define(
  "Alarm",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    objectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "guard_objects", key: "id" },
      comment: "На каком объекте произошла сработка",
    },
    triggerTime: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Точное время поступления сигнала на пульт",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Тип тревоги: Датчик движения, Кнопка ПАНИКА",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Тревога",
      comment: "Статусы: Тревога, Группа Выехала, Ложный вызов, Задержание",
    },
  },
  {
    tableName: "guard_alarms",
  },
);

Alarm.belongsTo(GuardObject, { foreignKey: "objectId", as: "protectedObject" });

module.exports = Alarm;
