const Fine = require("../../models/tpolice/fines");
require("dotenv").config();

module.exports = async (req, res) => {
  try {
    const { fromId, pinCode, amount, fineId } = req.body;

    // 1. Проверяем флаг инициализации банка
    if (process.env.SEQUELIZE_GAME_BANK_INIT !== "true") {
      return res.status(400).json({
        success: false,
        error:
          "Автоматическая оплата картой отключена. Пожалуйста, оплатите штраф лично в отделении ГАИ.",
      });
    }

    // 2. Проверяем наличие расчетного счета ГАИ
    const toId = process.env.TP_ID;
    if (!toId) {
      return res.status(500).json({
        success: false,
        error:
          "Критическая ошибка конфигурации: не задан целевой счет ГАИ (TP_ID в .env).",
      });
    }

    // 3. Составляем fetch-запрос перевода на сервер банка
    const bankUrl = process.env.BANK_URL || "http://localhost:3000";
    const bankResponse = await fetch(`${bankUrl}/bank/api/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromId,
        toId,
        amount: parseFloat(amount),
        pinCode,
        totpCode: "", // По ТЗ оставляем пустым
      }),
    });

    // 4. Если банк вернул 200 — обновляем статус штрафа в нашей БД
    if (bankResponse.status === 200) {
      await Fine.update({ status: "Выплачен" }, { where: { id: fineId } });
      return res.json({
        success: true,
        message: "Штраф успешно оплачен через банк!",
      });
    } else {
      const errorData = await bankResponse.json();
      return res.status(bankResponse.status).json({
        success: false,
        error: errorData.message || "Банк отклонил операцию.",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        error: "Не удалось связаться с банком: " + err.message,
      });
  }
};
