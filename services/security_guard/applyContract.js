const Contract = require("../../models/security_guard/contracts");

module.exports = async (req, res) => {
  try {
    const { address, cost } = req.body;

    await Contract.create({
      clientId: req.user.id,
      address,
      cost: parseFloat(cost),
      status: "На рассмотрении",
    });

    return res.json({
      success: true,
      message: "Заявка на подключение пультовой охраны успешно отправлена.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
