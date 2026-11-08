const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const CourtHistory = require("./history");

const Solution = sequelize.define(
  "Solution",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caseId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "court_history", key: "id" },
      comment: "Связь с номером судебного дела",
    },
    verdict: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Вердикт суда: Виновен, Оправдан, Иск удовлетворен",
    },
    sentence: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Мера наказания (срок заключения, размер компенсации)",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Статус исполнения приговора (исполнен или в процессе)",
    },
  },
  {
    tableName: "court_solutions",
  },
);

Solution.belongsTo(CourtHistory, { foreignKey: "caseId", as: "courtCase" });

module.exports = Solution;
