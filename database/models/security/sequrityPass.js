const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SecurityPass = sequelize.define("SecurityPass", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    passCode: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    facilityName: { type: DataTypes.STRING(128), allowNull: false },
    accessLevel: { type: DataTypes.INTEGER, defaultValue: 1 },
    validUntil: { type: DataTypes.DATE, allowNull: false },
    issuedByUid: { type: DataTypes.STRING(32), allowNull: false },
    isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  SecurityPass.associate = (db) => {
    if (db.Citizen) {
      SecurityPass.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return SecurityPass;
};
