const Fine = require("../../models/tpolice/fines");
const Car = require("../../models/tpolice/cars");
const User = require("../../models/uregistry/user");

module.exports = async (req, res) => {
  try {
    const {
      car,
      ouwner,
      date,
      time,
      violation,
      punishment_type,
      punishment_value,
      zone,
    } = req.body;

    // 1. Проверяем, зарегистрирован ли автомобиль в ГАИ
    let carRegistry = await Car.findByPk(car);
    if (!carRegistry) {
      // Пытаемся вытащить телефон и почту владельца из Единого Регистра Граждан
      const nameParts = ouwner.split(" ");
      const citizen = await User.findOne({
        where: { name: nameParts[0] || "", surname: nameParts[1] || "" },
      });

      // Автоматически регистрируем карточку машины
      carRegistry = await Car.create({
        number: car,
        owner_name: ouwner,
        owner_phone: citizen ? citizen.phone : "Не указан",
        owner_gmail: citizen ? citizen.gmail : "Не указан",
      });
    }

    // 2. Записываем правонарушение в журнал штрафов
    await Fine.create({
      carNumber: car,
      ouwner,
      date,
      time,
      violation,
      punishment_type,
      punishment_value,
      zone,
      collaborator: `${req.user.name} ${req.user.surname}`,
    });

    return res.json({
      success: true,
      message: "Протокол нарушения успешно внесен в базу ГАИ.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
