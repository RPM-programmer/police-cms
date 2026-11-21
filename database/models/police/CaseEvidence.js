const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("CaseEvidence", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caseNumber: { type: DataTypes.STRING(32), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    photoUrl: { type: DataTypes.STRING(512), allowNull: true },
    collectedByUid: { type: DataTypes.STRING(32), allowNull: false },
  });
};
