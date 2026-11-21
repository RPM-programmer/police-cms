const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DriverLicense = sequelize.define("DriverLicense", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    licenseNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    citizenUid: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    categories: { type: DataTypes.JSON, defaultValue: ["B"] },
    penaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("valid", "suspended", "revoked", "expired"),
      defaultValue: "valid",
    },
    revokedUntil: { type: DataTypes.DATEONLY, allowNull: true },
    issuedByUid: { type: DataTypes.STRING(32), allowNull: false },
  });

  DriverLicense.associate = (db) => {
    if (db.Citizen) {
      DriverLicense.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return DriverLicense;
};
