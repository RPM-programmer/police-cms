const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const Protocol = sequelize.define(
  "Protocol",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    offenderId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Нарушитель правопорядка",
    },
    article: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Статья КоАП (например, Мелкое хулиганство)",
    },
    penalty: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Штраф или назначенная мера воздействия",
    },
    officer: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Кто из милиционеров составил протокол",
    },
  },
  {
    tableName: "police_protocols",
  },
);

Protocol.belongsTo(User, { foreignKey: "offenderId", as: "offender" });

module.exports = Protocol;
