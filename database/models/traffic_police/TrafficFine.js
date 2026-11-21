const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TrafficFine = sequelize.define("TrafficFine", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fineNumber: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    plateNumber: { type: DataTypes.STRING(24), allowNull: true },
    article: { type: DataTypes.STRING(128), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    pointsAdded: { type: DataTypes.INTEGER, defaultValue: 0 },
    officerUid: { type: DataTypes.STRING(32), allowNull: false },
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  });

  TrafficFine.associate = (db) => {
    if (db.Citizen) {
      TrafficFine.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return TrafficFine;
};
