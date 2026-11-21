const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CriminalCase = sequelize.define("CriminalCase", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caseNumber: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    article: { type: DataTypes.STRING(128), allowNull: false },
    investigatorUid: { type: DataTypes.STRING(32), allowNull: false },
    departmentCode: {
      type: DataTypes.ENUM("police", "KGB"),
      defaultValue: "police",
    },
    summary: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("open", "sent_to_court", "closed", "suspended"),
      defaultValue: "open",
    },
  });

  CriminalCase.associate = (db) => {
    if (db.CaseParticipant) {
      CriminalCase.hasMany(db.CaseParticipant, {
        foreignKey: "caseNumber",
        sourceKey: "caseNumber",
        as: "participants",
      });
    }
    if (db.CaseEvidence) {
      CriminalCase.hasMany(db.CaseEvidence, {
        foreignKey: "caseNumber",
        sourceKey: "caseNumber",
        as: "evidences",
      });
    }
  };

  return CriminalCase;
};
