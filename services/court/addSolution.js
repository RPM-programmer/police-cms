const Solution = require("../../models/court/solutions");
const Permit = require("../../models/border/permits");

module.exports = async (req, res) => {
  try {
    const { caseId, verdict, sentence } = req.body;

    await Solution.create({
      caseId,
      verdict, // 'Виновен' / 'Оправдан'
      sentence,
      status: false,
    });

    // Связываем с историей, чтобы найти подсудимого
    const CourtHistory = require("../../models/court/history");
    await CourtHistory.update({ status: true }, { where: { id: caseId } });

    if (verdict === "Виновен") {
      const currentCase = await CourtHistory.findByPk(caseId);
      if (currentCase) {
        // СКВОЗНАЯ МЕХАНИКА: запрет на выезд из страны
        await Permit.upsert({
          userId: currentCase.defendantId,
          exitPermit: false,
          blackListStatus: "Судебное ограничение",
        });
      }
    }

    return res.json({
      success: true,
      message:
        "Официальный приговор вынесен и отправлен в исполнительные ведомства.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
