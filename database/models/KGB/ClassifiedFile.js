const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("ClassifiedFile", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fileCode: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    secrecyLevel: {
      type: DataTypes.ENUM("dsp", "secret", "top_secret", "special_importance"),
      allowNull: false,
    },
    targetType: {
      type: DataTypes.ENUM("citizen", "company", "officer", "event"),
      allowNull: false,
    },
    targetId: { type: DataTypes.STRING(32), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    encryptedPayload: { type: DataTypes.TEXT, allowNull: false },
    iv: { type: DataTypes.STRING(64), allowNull: false },
    authTag: { type: DataTypes.STRING(64), allowNull: false },
    curatorUid: { type: DataTypes.STRING(32), allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      defaultValue: "active",
    },
  });
};
