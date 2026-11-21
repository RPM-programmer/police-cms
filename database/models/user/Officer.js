const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Officer = sequelize.define("Officer", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    badgeNumber: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    citizenUid: { type: DataTypes.STRING(32), allowNull: false },
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
    rankId: { type: DataTypes.INTEGER, allowNull: false },
    division: { type: DataTypes.STRING(128), allowNull: true },
    clearanceLevel: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0 - нет, 3 - ДСП, 2 - Секретно, 1 - Сов. секретно
    permissions: { type: DataTypes.JSON, defaultValue: [] },
    isSuspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    hiredByUid: { type: DataTypes.STRING(32), allowNull: true },
  });

  Officer.associate = (db) => {
    if (db.Citizen) {
      Officer.belongsTo(db.Citizen, {
        foreignKey: "citizenUid",
        targetKey: "uid",
        as: "citizen",
      });
    }
    if (db.DepartmentRank) {
      Officer.belongsTo(db.DepartmentRank, {
        foreignKey: "rankId",
        as: "rank",
      });
    }
  };

  return Officer;
};
