const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("VehicleImpound", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vin: { type: DataTypes.STRING(32), allowNull: false },
    plateNumber: { type: DataTypes.STRING(24), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    impoundLot: { type: DataTypes.STRING(128), allowNull: false },
    officerUid: { type: DataTypes.STRING(32), allowNull: false },
    status: {
      type: DataTypes.ENUM("impounded", "released"),
      defaultValue: "impounded",
    },
  });
};
