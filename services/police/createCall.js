const Call = require("../../models/police/calls");

module.exports = async (req, res) => {
  try {
    const { address, description } = req.body;

    await Call.create({
      callerId: req.user.id,
      callerPhone: req.user.phone || "Не указан",
      address,
      description,
      status: "В обработке",
    });

    return res.json({
      success: true,
      message:
        "Экстренный вызов принят в дежурную часть. Наряд милиции формируется.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
