const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InspectionCheck = sequelize.define("InspectionCheck", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    checkNumber: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    companyCid: { type: DataTypes.STRING(32), allowNull: false },
    inspectionType: {
      type: DataTypes.ENUM("tax", "fire", "sanitary", "labor", "comprehensive"),
      allowNull: false,
    },
    inspectorUid: { type: DataTypes.STRING(32), allowNull: false },
    findings: { type: DataTypes.TEXT, allowNull: true },
    fineAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "in_progress",
        "passed",
        "violations_found",
      ),
      defaultValue: "scheduled",
    },
  });

  InspectionCheck.associate = (db) => {
    if (db.Company) {
      InspectionCheck.belongsTo(db.Company, {
        foreignKey: "companyCid",
        targetKey: "cid",
        as: "company",
      });
    }
  };

  return InspectionCheck;
};
