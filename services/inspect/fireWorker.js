const InspectWorker = require("../../models/inspect/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;

    const worker = await InspectWorker.findOne({
      where: { userId: citizenId },
    });
    if (!worker)
      return res
        .status(404)
        .json({
          success: false,
          error: "Инспектор не найден в реестре госслужащих.",
        });

    await InspectWorker.destroy({ where: { userId: citizenId } });
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message:
        "Государственный инспектор успешно отстранен от занимаемой должности.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
