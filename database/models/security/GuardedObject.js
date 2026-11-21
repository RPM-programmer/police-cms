const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("GuardedObject", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    objectCode: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(128), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    ownerType: {
      type: DataTypes.ENUM("citizen", "company", "government"),
      allowNull: false,
    },
    ownerId: { type: DataTypes.STRING(32), allowNull: false }, // UID, CID или код ведомства
    alarmStatus: {
      type: DataTypes.ENUM("disarmed", "armed", "alarm_triggered"),
      defaultValue: "armed",
    },
    assignedUnit: { type: DataTypes.STRING(64), allowNull: true },
  });
};
