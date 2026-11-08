const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const FineStandart = sequelize.define(
  "FineStandart",
  {
    violation_code: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Код статьи КоАП (например, 12.9.2)",
    },
    violation_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Полное юридическое наименование нарушения",
    },
    punishment_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    punishment_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "fine_standards",
  },
);

module.exports = FineStandart;
