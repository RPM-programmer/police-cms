const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SecurityClearance = sequelize.define("SecurityClearance", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    requestedForDept: { type: DataTypes.STRING(64), allowNull: false },
    clearanceLevel: { type: DataTypes.INTEGER, allowNull: false }, // 3 - ДСП, 2 - Секретно, 1 - Сов. секретно
    approvedByUid: { type: DataTypes.STRING(32), allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "approved", "denied", "revoked"),
      defaultValue: "pending",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  });

  SecurityClearance.associate = (db) => {
    if (db.Citizen) {
      SecurityClearance.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return SecurityClearance;
};
