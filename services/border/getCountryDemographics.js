const User = require("../../models/uregistry/user");
const Migration = require("../../models/border/migration");

module.exports = async (req, res) => {
  try {
    const totalCitizens = await User.count();

    // Считаем последние миграционные статусы
    const insideCountry = await User.count({
      where: {
        id: sequelize.literal(`
          (SELECT direction FROM migration_registry 
           WHERE migration_registry.user_id = User.id 
           ORDER BY migration_registry.created_at DESC LIMIT 1) = 'Въезд' 
          OR NOT EXISTS (SELECT 1 FROM migration_registry WHERE migration_registry.user_id = User.id)
        `),
      },
    });

    return res.json({
      success: true,
      stats: {
        totalRegistered: totalCitizens,
        presentInCountry: insideCountry,
        absentCount: totalCitizens - insideCountry,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
