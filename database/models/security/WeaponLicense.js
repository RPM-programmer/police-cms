const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WeaponLicense = sequelize.define("WeaponLicense", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    licenseNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    holderType: {
      type: DataTypes.ENUM("citizen", "company"),
      defaultValue: "citizen",
    },
    holderId: { type: DataTypes.STRING(32), allowNull: false }, // UID или CID
    category: {
      type: DataTypes.ENUM("civilian", "service", "security_agency"),
      allowNull: false,
    },
    issuedByUid: { type: DataTypes.STRING(32), allowNull: false },
    expiresAt: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "suspended", "revoked"),
      defaultValue: "active",
    },
  });

  WeaponLicense.associate = (db) => {
    if (db.WeaponRegistry) {
      WeaponLicense.hasMany(db.WeaponRegistry, {
        foreignKey: "licenseNumber",
        sourceKey: "licenseNumber",
        as: "weapons",
      });
    }
  };

  return WeaponLicense;
};
