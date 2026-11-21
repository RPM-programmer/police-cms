const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BusinessLicense = sequelize.define("BusinessLicense", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    licenseNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    companyCid: { type: DataTypes.STRING(32), allowNull: false },
    activityCategory: { type: DataTypes.STRING(128), allowNull: false },
    issuedByUid: { type: DataTypes.STRING(32), allowNull: false },
    expiresAt: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "suspended", "revoked"),
      defaultValue: "active",
    },
  });

  BusinessLicense.associate = (db) => {
    if (db.Company) {
      BusinessLicense.belongsTo(db.Company, {
        foreignKey: "companyCid",
        targetKey: "cid",
        as: "company",
      });
    }
  };

  return BusinessLicense;
};
