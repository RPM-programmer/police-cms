const CourtWorker = require("../../models/court/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;

    const worker = await CourtWorker.findOne({ where: { userId: citizenId } });
    if (!worker)
      return res
        .status(404)
        .json({
          success: false,
          error: "Сотрудник судебной власти не найден.",
        });

    await CourtWorker.destroy({ where: { userId: citizenId } });
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message:
        "Сотрудник успешно уволен из Министерства Юстиции, судебные полномочия аннулированы.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
