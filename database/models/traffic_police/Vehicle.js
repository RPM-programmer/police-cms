const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Vehicle", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vin: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    plateNumber: { type: DataTypes.STRING(24), unique: true, allowNull: false },
    brand: { type: DataTypes.STRING(64), allowNull: false },
    model: { type: DataTypes.STRING(64), allowNull: false },
    color: { type: DataTypes.STRING(32), allowNull: false },
    ownerType: {
      type: DataTypes.ENUM("citizen", "company", "department"),
      allowNull: false,
    },
    ownerId: { type: DataTypes.STRING(32), allowNull: false },
    isStolen: { type: DataTypes.BOOLEAN, defaultValue: false },
    isIntercepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    hasRegBan: { type: DataTypes.BOOLEAN, defaultValue: false },
    isImpounded: { type: DataTypes.BOOLEAN, defaultValue: false },
    techInspectionValidUntil: { type: DataTypes.DATEONLY, allowNull: true },
  });
};
