const GuardWorker = require("../../models/security_guard/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;

    const worker = await GuardWorker.findOne({ where: { userId: citizenId } });
    if (!worker)
      return res
        .status(404)
        .json({
          success: false,
          error: "Сотрудник не найден в штате Департамента Охраны.",
        });

    await GuardWorker.destroy({ where: { userId: citizenId } });
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message:
        "Сотрудник успешно уволен из Департамента Охраны, лицензии отозваны.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
