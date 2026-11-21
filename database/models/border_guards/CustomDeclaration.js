const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CustomsDeclaration = sequelize.define("CustomsDeclaration", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    declarationNumber: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    companyCid: { type: DataTypes.STRING(32), allowNull: false },
    cargoDescription: { type: DataTypes.TEXT, allowNull: false },
    declaredValue: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    dutyAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    inspectedByUid: { type: DataTypes.STRING(32), allowNull: true },
    status: {
      type: DataTypes.ENUM("submitted", "cleared", "seized_contraband"),
      defaultValue: "submitted",
    },
  });

  CustomsDeclaration.associate = (db) => {
    if (db.Company) {
      CustomsDeclaration.belongsTo(db.Company, {
        foreignKey: "companyCid",
        targetKey: "cid",
        as: "company",
      });
    }
  };

  return CustomsDeclaration;
};
