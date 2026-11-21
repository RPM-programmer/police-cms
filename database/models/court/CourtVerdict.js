const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("CourtVerdict", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    verdictNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    docketNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    judgeUid: { type: DataTypes.STRING(32), allowNull: false },
    verdictType: {
      type: DataTypes.ENUM("guilty", "acquitted", "satisfied", "dismissed"),
      allowNull: false,
    },
    punishment: { type: DataTypes.JSON, defaultValue: {} }, // { prisonDays, fineAmount, revokeLicense, freezeCompany }
    resolutionText: { type: DataTypes.TEXT, allowNull: false },
  });
};
