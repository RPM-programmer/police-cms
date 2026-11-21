const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BorderCrossing = sequelize.define("BorderCrossing", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    citizenPid: { type: DataTypes.STRING(32), allowNull: false },
    checkpoint: { type: DataTypes.STRING(128), allowNull: false },
    direction: { type: DataTypes.ENUM("entry", "exit"), allowNull: false },
    vehiclePlate: { type: DataTypes.STRING(24), allowNull: true },
    officerUid: { type: DataTypes.STRING(32), allowNull: false },
    decision: {
      type: DataTypes.ENUM("allowed", "denied", "detained"),
      defaultValue: "allowed",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  });

  BorderCrossing.associate = (db) => {
    if (db.Citizen) {
      BorderCrossing.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return BorderCrossing;
};
