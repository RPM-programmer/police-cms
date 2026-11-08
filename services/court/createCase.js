const CourtHistory = require("../../models/court/history");

module.exports = async (req, res) => {
  try {
    const { caseId, plaintiff, defendantId, info, date, time } = req.body;

    const newCase = await CourtHistory.create({
      id: caseId,
      plaintiff,
      defendantId,
      info,
      date,
      time,
      status: false, // Дело открыто
    });

    return res.json({
      success: true,
      message: `Судебное производство №${caseId} успешно открыто.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
