module.exports = async (sequelize, models) => {
  try {
    console.log("🔄 Настройка отношений между таблицами...");
    models.URegistry.User.hasMany(models.URegistry.Bank, {
      as: "bankAccounts",
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    models.URegistry.Bank.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    models.URegistry.User.hasMany(models.URegistry.Work, {
      as: "workHistory",
      foreignKey: "userId",
    });
    models.URegistry.Work.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    models.URegistry.User.hasMany(models.Police.Fine, {
      as: "fines",
      foreignKey: "userId",
    });
    models.Police.Fine.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    models.URegistry.User.hasMany(models.Police.Car, {
      as: "vehicles",
      foreignKey: "userId",
    });
    models.Police.Car.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    models.Police.FineStandart.hasMany(models.Police.Fine, {
      as: "issuedFines",
      foreignKey: "standartId",
    });
    models.Police.Fine.belongsTo(models.Police.FineStandart, {
      foreignKey: "standartId",
    });
    models.Court.Courts.hasMany(models.Court.History, {
      as: "cases",
      foreignKey: "courtId",
    });
    models.Court.History.belongsTo(models.Court.Courts, {
      foreignKey: "courtId",
    });
    models.URegistry.User.hasMany(models.Court.History, {
      as: "courtRecords",
      foreignKey: "userId",
    });
    models.Court.History.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    models.URegistry.User.hasMany(models.Security.Affair, {
      as: "investigations",
      foreignKey: "userId",
    });
    models.Security.Affair.belongsTo(models.URegistry.User, {
      foreignKey: "userId",
    });
    console.log("🔄 Запуск синхронизации таблиц SQLite (data.sqlite)...");
    await sequelize.sync({ force: false });
    console.log("✅ База данных успешно инициализирована и связана.");
  } catch (error) {
    console.error("🚨 Ошибка при сборке и инициализации БД:", error.message);
    throw error;
  }
};
