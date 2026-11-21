const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const News = sequelize.define("News", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    photoUrl: { type: DataTypes.STRING(512), allowNull: true },
    departmentCode: {
      type: DataTypes.ENUM(
        "police",
        "traffic_police",
        "security",
        "border_guards",
        "court",
        "InspectionMinistry",
        "KGB",
        "system",
      ),
      allowNull: false,
    },
    authorUid: { type: DataTypes.STRING(32), allowNull: false },
    isEmergency: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  News.associate = (db) => {
    if (db.Citizen) {
      News.belongsTo(db.Citizen, {
        foreignKey: "authorUid",
        targetKey: "uid",
        as: "author",
      });
    }
  };

  return News;
};
