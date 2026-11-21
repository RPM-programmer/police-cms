const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StateTender = sequelize.define("StateTender", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenderCode: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    customerDept: { type: DataTypes.STRING(64), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    budget: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    winnerCid: { type: DataTypes.STRING(32), allowNull: true },
    applications: { type: DataTypes.JSON, defaultValue: [] }, // [{ cid, offerAmount, comment }]
    status: {
      type: DataTypes.ENUM("open", "awarded", "completed", "cancelled"),
      defaultValue: "open",
    },
  });

  StateTender.associate = (db) => {
    if (db.Company) {
      StateTender.belongsTo(db.Company, {
        foreignKey: "winnerCid",
        targetKey: "cid",
        as: "winner",
      });
    }
  };

  return StateTender;
};
