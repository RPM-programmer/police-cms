const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("SystemState", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mode: {
      type: DataTypes.ENUM("normal", "cto", "emergency"),
      defaultValue: "normal",
    },
    reason: { type: DataTypes.TEXT, allowNull: true },
    activatedByUid: { type: DataTypes.STRING(32), allowNull: true },
  });
};
