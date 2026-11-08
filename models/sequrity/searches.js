const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Affair = require("./affairs");

const SearchOrder = sequelize.define(
  "SearchOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    affairId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "kgb_affairs", key: "id" },
      comment: "В рамках какого дела выписан ордер",
    },
    targetAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Адрес проведения мероприятий (жилье или организация)",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Тип ордера: Обыск, Арест фигуранта, Изъятие имущества",
    },
    signedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Кто санкционировал (ФИО судьи или военного прокурора)",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Активен",
      comment: "Статус: Активен, Применен, Истек",
    },
  },
  {
    tableName: "kgb_orders",
  },
);

SearchOrder.belongsTo(Affair, { foreignKey: "affairId", as: "affair" });

module.exports = SearchOrder;
