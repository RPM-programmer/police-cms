const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("TrafficAccident", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accidentCode: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    location: { type: DataTypes.STRING(255), allowNull: false },
    participants: { type: DataTypes.JSON, defaultValue: [] }, // [{ uid, plateNumber, isGuilty }]
    description: { type: DataTypes.TEXT, allowNull: false },
    schemeUrl: { type: DataTypes.STRING(512), allowNull: true },
    inspectorUid: { type: DataTypes.STRING(32), allowNull: false },
  });
};
