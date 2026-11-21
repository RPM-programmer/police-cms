const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DetentionRecord = sequelize.define("DetentionRecord", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
    officerUid: { type: DataTypes.STRING(32), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    seizedItems: { type: DataTypes.JSON, defaultValue: [] },
    detainedUntil: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("detained", "released", "arrested_by_court"),
      defaultValue: "detained",
    },
  });

  DetentionRecord.associate = (db) => {
    if (db.Citizen) {
      DetentionRecord.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return DetentionRecord;
};
