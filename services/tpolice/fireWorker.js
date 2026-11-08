const TPoliceWorker = require("../../models/tpolice/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { workerId } = req.body; // ID записи из таблицы сотрудников ГАИ

    // 1. Находим служебную карточку сотрудника
    const worker = await TPoliceWorker.findByPk(workerId);
    if (!worker) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Сотрудник ГАИ с таким внутренним ID не найден.",
        });
    }

    const citizenId = worker.userId;

    // 2. Удаляем запись из таблицы сотрудников ГАИ
    await TPoliceWorker.destroy({ where: { id: workerId } });

    // 3. СКВЕЗНОЕ ОБНОВЛЕНИЕ: Сбрасываем рабочие поля гражданина в Едином Регистре
    await User.update(
      {
        work: null,
        position: null,
      },
      {
        where: { id: citizenId },
      },
    );

    return res.json({
      success: true,
      message:
        "Сотрудник успешно уволен из рядов ГАИ, служебный доступ аннулирован.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
