const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Department", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: {
      type: DataTypes.ENUM(
        "police",
        "traffic_police",
        "security",
        "border_guards",
        "court",
        "InspectionMinistry",
        "KGB",
      ),
      unique: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING(128), allowNull: false },
    aboutText: { type: DataTypes.TEXT, allowNull: true },
    socialLinks: { type: DataTypes.JSON, defaultValue: {} },
    badgeColor: { type: DataTypes.STRING(128), allowNull: false },
  });
};
