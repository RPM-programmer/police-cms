const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");
const Affair = require("./affairs");

const Suspect = sequelize.define(
  "Suspect",
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
      comment: "Связь с номером уголовного дела КГБ",
    },
    citizenId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "UID гражданина под наблюдением",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Процессуальный статус: Подозреваемый, Свидетель, Информатор",
    },
    wiretapData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment:
        "Сводка оперативных данных, логи прослушки и наружного наблюдения",
    },
  },
  {
    tableName: "kgb_suspects",
  },
);

Suspect.belongsTo(User, { foreignKey: "citizenId", as: "citizen" });
Suspect.belongsTo(Affair, { foreignKey: "affairId", as: "affair" });

module.exports = Suspect;
