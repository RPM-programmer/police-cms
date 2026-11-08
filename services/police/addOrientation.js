const Orientation = require("../../models/police/orientations");

module.exports = async (req, res) => {
  try {
    const { targetUserId, reason, dangerLevel } = req.body;

    await Orientation.create({
      targetUserId,
      reason,
      dangerLevel,
      status: "В розыске",
    });

    return res.json({
      success: true,
      message: "Ориентировка успешно разослана по всем постам правопорядка.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
