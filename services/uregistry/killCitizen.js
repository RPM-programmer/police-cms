const User = require("../../models/uregistry/user");
const Passport = require("../../models/uregistry/passports");
const TPoliceWorker = require("../../models/tpolice/workers");
const PoliceWorker = require("../../models/police/workers");
const GuardWorker = require("../../models/security_guard/workers");
const KGBWorker = require("../../models/sequrity/workers");
const BorderWorker = require("../../models/border/workers");
const CourtWorker = require("../../models/court/workers");
const InspectWorker = require("../../models/inspect/workers");

module.exports = async (req, res) => {
  try {
    const { uid } = req.params;

    const citizen = await User.findByPk(uid);
    if (!citizen)
      return res
        .status(404)
        .json({ success: false, error: "Гражданин не найден." });

    // Каскадное удаление из личного состава всех ведомств
    await TPoliceWorker.destroy({ where: { userId: uid } });
    await PoliceWorker.destroy({ where: { userId: uid } });
    await GuardWorker.destroy({ where: { userId: uid } });
    await KGBWorker.destroy({ where: { userId: uid } });
    await BorderWorker.destroy({ where: { userId: uid } });
    await CourtWorker.destroy({ where: { userId: uid } });
    await InspectWorker.destroy({ where: { userId: uid } });

    // Удаление паспорта и профиля
    await Passport.destroy({ where: { uid } });
    await User.destroy({ where: { id: uid } });

    return res.json({
      success: true,
      message: `Гражданин ${citizen.name} ${citizen.surname} официально снят с учета (Биологическая смерть / Удаление).`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
