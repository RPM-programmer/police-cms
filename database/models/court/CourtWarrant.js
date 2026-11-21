const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("CourtWarrant", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    warrantNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "arrest",
        "search",
        "wiretap",
        "asset_freeze",
        "travel_ban",
      ),
      allowNull: false,
    },
    targetType: {
      type: DataTypes.ENUM("citizen", "company", "vehicle"),
      allowNull: false,
    },
    targetId: { type: DataTypes.STRING(32), allowNull: false },
    requestedByDept: { type: DataTypes.STRING(64), allowNull: false },
    requestedByUid: { type: DataTypes.STRING(32), allowNull: false },
    judgeUid: { type: DataTypes.STRING(32), allowNull: true },
    grounds: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "executed",
        "expired",
      ),
      defaultValue: "pending",
    },
    validUntil: { type: DataTypes.DATE, allowNull: true },
    digitalSignature: { type: DataTypes.STRING(255), allowNull: true },
  });
};
