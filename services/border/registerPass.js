const Migration = require("../../models/border/migration");
const Permit = require("../../models/border/permits");

module.exports = async (req, res) => {
  try {
    const { citizenId, passportId, direction, purpose } = req.body;

    // 1. Проверяем стоп-листы и разрешения на выезд
    const permit = await Permit.findOne({ where: { userId: citizenId } });
    if (direction === "Выезд" && permit && !permit.exitPermit) {
      return res.status(403).json({
        success: false,
        error: `ВЫЕЗД ЗАПРЕЩЕН. Причина: ${permit.blackListStatus}`,
      });
    }

    // 2. Логируем прохождение КПП
    const now = new Date();
    await Migration.create({
      userId: citizenId,
      passportId,
      direction, // 'Въезд' / 'Выезд'
      timestamp: now.toLocaleString(),
      purpose,
    });

    return res.json({
      success: true,
      message: `Пересечение границы (${direction}) успешно оформлено.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
