const Affair = require("../../models/sequrity/affairs");

module.exports = async (req, res) => {
  try {
    const { affairId, name, accusation } = req.body;

    await Affair.create({
      id: affairId,
      name,
      accusation,
      responsibleAgent: req.user.callsign || `Агент #${req.user.id}`,
      status: "Открыто",
    });

    return res.json({
      success: true,
      message: `Секретное дело разработки [${name}] успешно открыто.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
