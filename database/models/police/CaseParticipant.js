const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CaseParticipant = sequelize.define("CaseParticipant", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    caseNumber: { type: DataTypes.STRING(32), allowNull: false },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    role: {
      type: DataTypes.ENUM("victim", "witness", "suspect", "accused"),
      allowNull: false,
    },
    testimony: { type: DataTypes.TEXT, allowNull: true },
  });

  CaseParticipant.associate = (db) => {
    if (db.Citizen) {
      CaseParticipant.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return CaseParticipant;
};
