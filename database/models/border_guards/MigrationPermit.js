const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MigrationPermit = sequelize.define("MigrationPermit", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    permitNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    type: {
      type: DataTypes.ENUM("visa", "rvp", "vnj", "border_zone_pass"),
      allowNull: false,
    },
    validUntil: { type: DataTypes.DATEONLY, allowNull: false },
    issuedByUid: { type: DataTypes.STRING(32), allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "expired", "revoked"),
      defaultValue: "active",
    },
  });

  MigrationPermit.associate = (db) => {
    if (db.Citizen) {
      MigrationPermit.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return MigrationPermit;
};
