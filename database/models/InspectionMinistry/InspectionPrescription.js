const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InspectionPrescription = sequelize.define("InspectionPrescription", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prescriptionNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    checkNumber: { type: DataTypes.STRING(32), allowNull: false },
    companyCid: { type: DataTypes.STRING(32), allowNull: false },
    requirements: { type: DataTypes.TEXT, allowNull: false },
    deadline: { type: DataTypes.DATEONLY, allowNull: false },
    suspendOperations: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.ENUM("active", "fulfilled", "overdue"),
      defaultValue: "active",
    },
  });

  InspectionPrescription.associate = (db) => {
    if (db.Company) {
      InspectionPrescription.belongsTo(db.Company, {
        foreignKey: "companyCid",
        targetKey: "cid",
        as: "company",
      });
    }
  };

  return InspectionPrescription;
};
