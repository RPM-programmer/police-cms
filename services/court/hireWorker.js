const CourtWorker = require("../../models/court/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, licenseNumber, rank, bankAccountId } = req.body;

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

    await CourtWorker.create({
      userId: citizenId,
      licenseNumber,
      rank,
      position: "court_clerk", // По умолчанию принимается как секретарь/клерк
      bankAccountId,
    });

    await User.update(
      {
        work: "Суд",
        position: "court_clerk",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Сотрудник ${citizen.name} ${citizen.surname} успешно назначен в Судейский корпус.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
