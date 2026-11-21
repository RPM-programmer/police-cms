const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WantedPerson = sequelize.define("WantedPerson", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    targetUid: { type: DataTypes.STRING(32), allowNull: false },
    initiatedByDept: {
      type: DataTypes.ENUM("police", "KGB", "court"),
      allowNull: false,
    },
    initiatorUid: { type: DataTypes.STRING(32), allowNull: false },
    article: { type: DataTypes.STRING(128), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    dangerLevel: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    photoSketchUrl: { type: DataTypes.STRING(512), allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "captured", "cancelled"),
      defaultValue: "active",
    },
  });

  WantedPerson.associate = (db) => {
    if (db.Citizen) {
      WantedPerson.belongsTo(db.Citizen, {
        foreignKey: "targetUid",
        targetKey: "uid",
        as: "target",
      });
    }
  };

  return WantedPerson;
};
