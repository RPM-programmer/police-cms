const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const Institution = require("./institutions");

const License = sequelize.define(
  "License",
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
      comment: "Для какой организации выписано разрешение",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        "Тип лицензии (например: Торговая, Алкогольная, Пожарный допуск)",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Активна",
      comment:
        "Текущее юридическое состояние: Активна, Приостановлена, Отозвана",
    },
  },
  {
    tableName: "inspect_licenses",
  },
);

License.belongsTo(Institution, {
  foreignKey: "institutionId",
  as: "licensedInstitution",
});

module.exports = License;
