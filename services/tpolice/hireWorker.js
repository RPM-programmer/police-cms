const TPoliceWorker = require("../../models/tpolice/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId, badgeNumber, rank, bankAccountId, patrolCar } = req.body;

    // 1. Проверяем, существует ли вообще такой гражданин в государстве
    const citizen = await User.findByPk(citizenId);
    if (!citizen) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Гражданин с таким UID не найден в Едином Регистре.",
        });
    }

    // 2. Проверяем, не работает ли он уже где-то в органах
    if (citizen.work) {
      return res
        .status(400)
        .json({
          success: false,
          error: `Этот гражданин уже трудоустроен в ведомство: ${citizen.work}`,
        });
    }

    // 3. Создаем служебную карточку сотрудника в базе ГАИ
    await TPoliceWorker.create({
      userId: citizenId,
      badgeNumber,
      rank,
      position: "gai_officer", // Базовая должность при приеме
      patrolCar: patrolCar || null,
      bankAccountId,
    });

    // 4. СКВЕЗНОЕ ОБНОВЛЕНИЕ: Прописываем место работы и должность в глобальный профиль юзера
    await User.update(
      {
        work: "ГАИ",
        position: "gai_officer",
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message: `Гражданин ${citizen.name} ${citizen.surname} успешно принят на службу в ГАИ (Жетон: ${badgeNumber}).`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
