const KGBWorker = require("../../models/sequrity/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;

    // 1. Проверяем, кто делает запрос. Из КГБ может уволить (отстранить) только Глобальный Админ
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error:
          "ОТКАЗ В ДОСТУПЕ. Из Комитета Государственной Безопасности нельзя уволиться самостоятельно или решением ведомства. Отстранение возможно только указом Высшей Администрации государства.",
      });
    }

    // 2. Ищем агента в секретной базе
    const agent = await KGBWorker.findOne({ where: { userId: citizenId } });
    if (!agent) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Указанный агент не найден в оперативном составе КГБ.",
        });
    }

    // 3. Если запрос от админа — производим полное принудительное аннулирование секретного допуска
    await KGBWorker.destroy({ where: { userId: citizenId } });

    // Сбрасываем рабочие поля в Едином Регистре Граждан
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message: `Оперативник с UID ${citizenId} официально отстранен от оперативной службы КГБ решением Администрации. Секретный допуск полностью аннулирован.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
