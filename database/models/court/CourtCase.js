const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CourtCase = sequelize.define("CourtCase", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    docketNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "criminal",
        "administrative",
        "arbitration",
        "appeal",
      ),
      allowNull: false,
    },
    sourceCaseNumber: { type: DataTypes.STRING(32), allowNull: true },
    plaintiffId: { type: DataTypes.STRING(32), allowNull: false }, // UID, CID или код ведомства
    defendantId: { type: DataTypes.STRING(32), allowNull: false }, // UID или CID
    judgeUid: { type: DataTypes.STRING(32), allowNull: true },
    hearingDate: { type: DataTypes.DATE, allowNull: true },
    summary: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(
        "filed",
        "scheduled",
        "in_hearing",
        "verdict_issued",
        "appealed",
      ),
      defaultValue: "filed",
    },
  });

  CourtCase.associate = (db) => {
    if (db.CourtVerdict) {
      CourtCase.hasOne(db.CourtVerdict, {
        foreignKey: "docketNumber",
        sourceKey: "docketNumber",
        as: "verdict",
      });
    }
  };

  return CourtCase;
};
