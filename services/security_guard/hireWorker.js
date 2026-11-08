const GuardWorker = require("../../models/security_guard/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, licenseNumber, rank, bankAccountId, assignedPost } =
      req.body;

    // 1. Проверяем существование человека в государстве
    const citizen = await User.findByPk(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Гражданин с указанным UID не числится в Едином Регистре.",
        });
    }

    // 2. Проверяем, не занят ли он на другой госслужбе
    if (citizen.work) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Данный гражданин уже числится в ведомстве: ${citizen.work}`,
        });
    }

    // 3. Заводим личное дело сотрудника охраны
    await GuardWorker.create({
      userId: citizenId,
      licenseNumber,
      rank,
      position: "guard_officer", // Начальная роль во фракции
      assignedPost: assignedPost || null,
      bankAccountId,
    });

    // 4. СКВОЗНОЕ ОБНОВЛЕНИЕ: Прописываем работу и системную должность в карточку юзера
    await User.update(
      {
        work: "Охрана",
        position: "guard_officer",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Гражданин ${citizen.name} ${citizen.surname} успешно принят в Департамент Охраны на должность сотрудника.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
