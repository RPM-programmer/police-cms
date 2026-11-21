const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ForensicData = sequelize.define("ForensicData", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    citizenUid: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    fingerprintHash: {
      type: DataTypes.STRING(128),
      unique: true,
      allowNull: false,
    },
    dnaCode: { type: DataTypes.STRING(128), unique: true, allowNull: false },
    recordedByUid: { type: DataTypes.STRING(32), allowNull: false },
  });

  ForensicData.associate = (db) => {
    if (db.Citizen) {
      ForensicData.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return ForensicData;
};
