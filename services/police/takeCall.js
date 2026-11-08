const Call = require("../../models/police/calls");

module.exports = async (req, res) => {
  try {
    const { id } = req.params; // ID вызова
    const { status } = req.body; // "Выезд наряда" или "Закрыт"

    await Call.update(
      {
        status,
        assignedOfficer: `${req.user.name} ${req.user.surname}`,
      },
      { where: { id } },
    );

    return res.json({
      success: true,
      message: `Статус происшествия изменен на: ${status}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
