const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const User = require("../uregistry/user");

const BorderWorker = sequelize.define(
  "BorderWorker",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      comment: "Связь с гражданином из Единого Регистра",
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Воинское звание пограничника",
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Системная должность: border_officer или border_boss",
    },
    kpp_post: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Закрепленный контрольно-пропускной пункт (КПП)",
    },
    bankAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Счет сотрудника для начисления денежного довольствия",
    },
  },
  {
    tableName: "border_workers",
  },
);

BorderWorker.belongsTo(User, { foreignKey: "userId", as: "citizenProfile" });

module.exports = BorderWorker;
