const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CrimeReport = sequelize.define("CrimeReport", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reportNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    applicantUid: { type: DataTypes.STRING(32), allowNull: false },
    suspectUid: { type: DataTypes.STRING(32), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    assignedOfficerUid: { type: DataTypes.STRING(32), allowNull: true },
    status: {
      type: DataTypes.ENUM("registered", "checking", "case_opened", "rejected"),
      defaultValue: "registered",
    },
  });

  CrimeReport.associate = (db) => {
    if (db.Citizen) {
      CrimeReport.belongsTo(db.Citizen, {
        foreignKey: "applicantUid",
        targetKey: "uid",
        as: "applicant",
      });
      CrimeReport.belongsTo(db.Citizen, {
        foreignKey: "suspectUid",
        targetKey: "uid",
        as: "suspect",
      });
    }
  };

  return CrimeReport;
};
