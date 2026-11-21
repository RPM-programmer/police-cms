const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("EmergencyCall", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    callCode: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    callerUid: { type: DataTypes.STRING(32), allowNull: true },
    location: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    assignedCrew: { type: DataTypes.STRING(64), allowNull: true },
    status: {
      type: DataTypes.ENUM("new", "dispatched", "on_scene", "closed"),
      defaultValue: "new",
    },
  });
};
