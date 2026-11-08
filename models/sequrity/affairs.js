const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Affair = sequelize.define(
  "Affair",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Номер секретного дела (например, Дело №007)",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Кодовое название оперативной разработки",
    },
    accusation: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Статьи Уголовного Кодекса (например: Измена государству)",
    },
    responsibleAgent: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Позывной или ID агента, ведущего следствие",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Открыто",
      comment: "Состояние расследования: Открыто, Засекречено, Закрыто",
    },
  },
  {
    tableName: "kgb_affairs",
  },
);

module.exports = Affair;
