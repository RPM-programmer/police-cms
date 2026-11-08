const KGBWorker = require("../../models/sequrity/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, callsign, clearanceLevel, bankAccountId } = req.body;

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

    await KGBWorker.create({
      userId: citizenId,
      callsign,
      clearanceLevel: parseInt(clearanceLevel) || 1,
      position: "kgb_agent",
      bankAccountId,
    });

    await User.update(
      {
        work: "КГБ",
        position: "kgb_agent",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Оперативник успешно зачислен в состав КГБ под позывным [${callsign}]. Данные засекречены.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
