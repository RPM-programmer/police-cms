const BorderWorker = require("../../models/border/workers");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const { citizenId } = req.body;

    const worker = await BorderWorker.findOne({ where: { userId: citizenId } });
    if (!worker)
      return res
        .status(404)
        .json({
          success: false,
          error: "Военнослужащий не найден в составе Погранвойск.",
        });

    await BorderWorker.destroy({ where: { userId: citizenId } });
    await User.update(
      { work: null, position: null },
      { where: { id: citizenId } },
    );

    return res.json({
      success: true,
      message: "Пограничник успешно снят с наряда и уволен в запас.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
