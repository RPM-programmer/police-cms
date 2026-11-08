const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Institution = require("./institutions");

const Check = sequelize.define(
  "Check",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    institutionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "inspect_institutions", key: "id" },
      comment: "Какое именно предприятие проверяется",
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Дата проведения инспекции",
    },
    violationsFound: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Подробный список обнаруженных нарушений (если есть)",
    },
    fineAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      comment: "Сумма наложенного административного штрафа",
    },
    inspector: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ФИО и удостоверение проверявшего инспектора",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Нарушения не устранены",
      comment: "Статусы: Пройдена успешно, Нарушения не устранены, Закрыта",
    },
  },
  {
    tableName: "inspect_checks",
  },
);

Check.belongsTo(Institution, {
  foreignKey: "institutionId",
  as: "targetInstitution",
});

module.exports = Check;
