const Check = require("../../models/inspect/checks");
const License = require("../../models/inspect/licenses");

module.exports = async (req, res) => {
  try {
    const { institutionId, violationsFound, fineAmount, revokeLicense } =
      req.body;

    const now = new Date();
    await Check.create({
      institutionId,
      date: now.toLocaleDateString(),
      violationsFound,
      fineAmount: parseFloat(fineAmount) || 0,
      inspector: `${req.user.name} (Инспекция)`,
      status: violationsFound ? "Нарушения не устранены" : "Пройдена успешно",
    });

    // Если нарушения критические, автоматически приостанавливаем коммерческую лицензию
    if (revokeLicense) {
      await License.update(
        { status: "Приостановлена" },
        { where: { institutionId } },
      );
    }

    return res.json({
      success: true,
      message: "Результаты государственной проверки успешно задокументированы.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
