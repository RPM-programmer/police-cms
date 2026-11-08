const PoliceWorker = require("../../models/police/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const {
      citizenId,
      badge,
      rank,
      department,
      position,
      weapon,
      bankAccountId,
    } = req.body;

    const citizen = await User.findByPk(citizenId);
    if (!citizen)
      return res
        .status(404)
        .json({ success: false, error: "Гражданин не найден." });
    if (citizen.work)
      return res
        .status(400)
        .json({ success: false, error: "Гражданин уже трудоустроен." });

    await PoliceWorker.create({
      userId: citizenId,
      badge,
      rank,
      department,
      position,
      weapon,
      bankAccountId,
    });

    await User.update(
      { work: "Милиция", position },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message: `Сотрудник ${citizen.name} успешно заступил на службу в Милицию.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
