const InspectWorker = require("../../models/inspect/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, license, category, bankAccountId } = req.body;

    const citizen = await User.findByPk(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Гражданин не найден в Едином Регистре.",
        });
    }
    if (citizen.work) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Гражданин уже трудоустроен в ведомство: ${citizen.work}`,
        });
    }

    await InspectWorker.create({
      userId: citizenId,
      license,
      category, // Сфера надзора (пожарный, санитарный, налоговый)
      position: "inspector",
      bankAccountId,
    });

    await User.update(
      {
        work: "Инспекция",
        position: "inspector",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Гражданин ${citizen.name} ${citizen.surname} успешно назначен Государственным Инспектором (${category} надзор).`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
