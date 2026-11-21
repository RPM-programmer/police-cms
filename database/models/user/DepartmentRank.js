const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DepartmentRank = sequelize.define("DepartmentRank", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    departmentCode: {
      type: DataTypes.ENUM(
        "police",
        "traffic_police",
        "security",
        "border_guards",
        "court",
        "InspectionMinistry",
        "KGB",
      ),
      allowNull: false,
    },
    title: { type: DataTypes.STRING(64), allowNull: false },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    permissions: { type: DataTypes.JSON, defaultValue: [] },
  });

  DepartmentRank.associate = (db) => {
    if (db.Officer) {
      DepartmentRank.hasMany(db.Officer, { foreignKey: "rankId" });
    }
  };

  return DepartmentRank;
};
