const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BorderBan = sequelize.define("BorderBan", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    targetUid: { type: DataTypes.STRING(32), allowNull: false },
    targetPid: { type: DataTypes.STRING(32), allowNull: false },
    banType: {
      type: DataTypes.ENUM("exit_ban", "entry_ban", "full_block"),
      allowNull: false,
    },
    initiatedByDept: {
      type: DataTypes.ENUM("border_guards", "police", "KGB", "court"),
      allowNull: false,
    },
    reason: { type: DataTypes.TEXT, allowNull: false },
    validUntil: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  BorderBan.associate = (db) => {
    if (db.Citizen) {
      BorderBan.belongsTo(db.Citizen, {
        foreignKey: "targetUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
  };

  return BorderBan;
};
