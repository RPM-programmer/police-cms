const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Call = sequelize.define(
  "Call",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    callerId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Кто совершил вызов через сайт",
    },
    callerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Место происшествия",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Что именно случилось (суть обращения)",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "В обработке",
      comment: "Статусы: В обработке, Выезд наряда, Закрыт",
    },
    assignedOfficer: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ФИО или жетон сотрудника, взявшего вызов",
    },
  },
  {
    tableName: "police_calls",
  },
);

Call.belongsTo(User, { foreignKey: "callerId", as: "caller" });

module.exports = Call;
