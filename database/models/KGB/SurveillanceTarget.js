const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("SurveillanceTarget", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    targetType: {
      type: DataTypes.ENUM("citizen", "company", "officer"),
      allowNull: false,
    },
    targetId: { type: DataTypes.STRING(32), allowNull: false },
    measures: { type: DataTypes.JSON, defaultValue: [] }, // ['wiretap', 'border_alert', 'bank_monitor']
    warrantNumber: { type: DataTypes.STRING(32), allowNull: true },
    curatorUid: { type: DataTypes.STRING(32), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });
};
