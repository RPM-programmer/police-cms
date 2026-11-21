const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AuditLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      actorUid: { type: DataTypes.STRING(32), allowNull: true },
      departmentCode: { type: DataTypes.STRING(32), allowNull: true },
      action: { type: DataTypes.STRING(128), allowNull: false },
      targetTable: { type: DataTypes.STRING(64), allowNull: false },
      targetRecordId: { type: DataTypes.STRING(64), allowNull: true },
      beforeData: { type: DataTypes.JSON, allowNull: true },
      afterData: { type: DataTypes.JSON, allowNull: true },
      ipAddress: { type: DataTypes.STRING(64), allowNull: true },
    },
    { updatedAt: false },
  );
};
