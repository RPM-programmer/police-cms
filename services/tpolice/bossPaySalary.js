const User = require("../../models/uregistry/user");
require("dotenv").config();

module.exports = async (req, res) => {
  try {
    const { employeeId, employeeAccountId, salaryAmount } = req.body;

    const employee = await User.findByPk(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Сотрудник не найден в базе граждан." });
    }

    const bankUrl = process.env.BANK_URL || "http://localhost:3000";
    const bankResponse = await fetch(`${bankUrl}/bank/api/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromId: process.env.TP_ID, // Счет министерства ГАИ из настроек .env
        toId: employeeAccountId, // Счет сотрудника
        amount: parseFloat(salaryAmount),
        pinCode: process.env.TP_BANK_PIN, // Пин-код от гос. счета ГАИ
        totpCode: "",
      }),
    });

    if (bankResponse.status !== 200) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Банк отказал в списании бюджетных средств.",
        });
    }

    return res.json({
      success: true,
      message: `Заработная плата переведена сотруднику ${employee.name}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
