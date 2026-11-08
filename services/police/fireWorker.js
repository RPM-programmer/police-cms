const PoliceWorker = require("../../models/police/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;
    await PoliceWorker.destroy({ where: { userId: citizenId } });
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );
    return res.json({
      success: true,
      message: "Сотрудник успешно уволен из органов Милиции.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
