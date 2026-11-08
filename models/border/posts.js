const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const BorderPost = sequelize.define(
  "BorderPost",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "Идентификатор пограничного пункта / КПП",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Наименование КПП (например: КПП Брузги, КПП Юг)",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Географическое расположение или участок границы",
    },
  },
  {
    tableName: "border_posts",
  },
);

module.exports = BorderPost;
