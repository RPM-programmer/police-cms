const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Citizen = sequelize.define("Citizen", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uid: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    pid: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    firstName: { type: DataTypes.STRING(64), allowNull: false },
    lastName: { type: DataTypes.STRING(64), allowNull: false },
    middleName: { type: DataTypes.STRING(64), allowNull: true },
    birthDate: { type: DataTypes.DATEONLY, allowNull: false },
    phone: { type: DataTypes.STRING(32), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(128), unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    photoUrl: { type: DataTypes.STRING(512), allowNull: true },
    isWanted: { type: DataTypes.BOOLEAN, defaultValue: false },
    isArrested: { type: DataTypes.BOOLEAN, defaultValue: false },
    travelBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
    criminalRecordsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    registeredByUid: { type: DataTypes.STRING(32), allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "deceased", "deported", "blocked"),
      defaultValue: "active",
    },
  });

  Citizen.associate = (db) => {
    if (db.Officer) {
      Citizen.hasMany(db.Officer, {
        foreignKey: "citizenUid",
        sourceKey: "uid",
        as: "positions",
      });
    }
    if (db.Company) {
      Citizen.hasMany(db.Company, {
        foreignKey: "ownerUid",
        sourceKey: "uid",
        as: "companies",
      });
    }
  };

  return Citizen;
};
