const Fine = require("../../models/tpolice/fines");

module.exports = async (req, res) => {
  try {
    // Находим все штрафы нарушителя, чьи ФИО совпадают с текущим юзером
    const userFines = await Fine.findAll({
      where: {
        ouwner: `${req.user.name} ${req.user.surname}`,
        status: "Не выплачен",
      },
    });

    return res.json({ success: true, fines: userFines });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
