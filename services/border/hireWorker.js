const BorderWorker = require("../../models/border/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, rank, bankAccountId, kppPost } = req.body;

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

    await BorderWorker.create({
      userId: citizenId,
      rank,
      position: "border_officer",
      kpp_post: kppPost || null,
      bankAccountId,
    });

    await User.update(
      {
        work: "Пограничники",
        position: "border_officer",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Сотрудник ${citizen.name} ${citizen.surname} успешно принят на службу в Пограничную службу.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
