const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AlarmIncident = sequelize.define("AlarmIncident", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    objectCode: { type: DataTypes.STRING(32), allowNull: false },
    crewName: { type: DataTypes.STRING(64), allowNull: true },
    report: { type: DataTypes.TEXT, allowNull: true },
    detainedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("active", "dispatched", "resolved", "false_alarm"),
      defaultValue: "active",
    },
  });

  AlarmIncident.associate = (db) => {
    if (db.GuardedObject) {
      AlarmIncident.belongsTo(db.GuardedObject, {
        foreignKey: "objectCode",
        targetKey: "objectCode",
        as: "object",
      });
    }
  };

  return AlarmIncident;
};
