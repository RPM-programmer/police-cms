const Contract = require("../../models/security_guard/contracts");
const GuardObject = require("../../models/security_guard/objects");

module.exports = async (req, res) => {
  try {
    const { contractId } = req.body;

    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Договор на охрану не найден в реестре.",
        });
    }

    await contract.update({ status: "Активен" });

    // Автоматически ставим объект на централизованный пульт в режим охраны
    await GuardObject.create({
      contractId,
      address: contract.address,
      alarmSystemStatus: "На охране",
    });

    return res.json({
      success: true,
      message: "Договор подписан, объект успешно взят под физическую охрану.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
