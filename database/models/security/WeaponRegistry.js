const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WeaponRegistry = sequelize.define("WeaponRegistry", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    serialNumber: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
    },
    model: { type: DataTypes.STRING(64), allowNull: false },
    caliber: { type: DataTypes.STRING(32), allowNull: false },
    ownerUid: { type: DataTypes.STRING(32), allowNull: false },
    licenseNumber: { type: DataTypes.STRING(32), allowNull: false },
    ballisticCode: {
      type: DataTypes.STRING(128),
      unique: true,
      allowNull: false,
    },
    isSeized: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  WeaponRegistry.associate = (db) => {
    if (db.Citizen) {
      WeaponRegistry.belongsTo(db.Citizen, {
        foreignKey: "ownerUid",
        targetKey: "uid",
        as: "owner",
      });
    }
  };

  return WeaponRegistry;
};
