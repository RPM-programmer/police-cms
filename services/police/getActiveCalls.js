const Call = require("../../models/police/calls");

module.exports = async (req, res) => {
  try {
    const activeCalls = await Call.findAll({
      where: { status: ["В обработке", "Выезд наряда"] },
    });
    return res.json({ success: true, list: activeCalls });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
