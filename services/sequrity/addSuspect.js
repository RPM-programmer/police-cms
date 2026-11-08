const Suspect = require("../../models/sequrity/suspects");

module.exports = async (req, res) => {
  try {
    const { affairId, citizenId, status, wiretapData } = req.body;

    await Suspect.create({
      affairId,
      citizenId,
      status, // 'Подозреваемый' / 'Информатор'
      wiretapData,
    });

    return res.json({
      success: true,
      message: "Данные наружного наблюдения внесены в материалы дела.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
