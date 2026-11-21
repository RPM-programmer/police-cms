const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Company = sequelize.define("Company", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cid: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(128), unique: true, allowNull: false },
    ownerUid: { type: DataTypes.STRING(32), allowNull: false },
    ownerPid: { type: DataTypes.STRING(32), allowNull: false },
    phone: { type: DataTypes.STRING(32), allowNull: false },
    email: { type: DataTypes.STRING(128), allowNull: false },
    initialCapital: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    activityType: { type: DataTypes.STRING(128), allowNull: true },
    isFrozen: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "suspended",
        "liquidated",
      ),
      defaultValue: "pending",
    },
    reviewedByUid: { type: DataTypes.STRING(32), allowNull: true },
    reviewComment: { type: DataTypes.TEXT, allowNull: true },
  });

  Company.associate = (db) => {
    if (db.Citizen) {
      Company.belongsTo(db.Citizen, {
        foreignKey: "ownerUid",
        targetKey: "uid",
        as: "owner",
      });
    }
  };

  return Company;
};
