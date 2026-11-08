const Car = require("../../models/tpolice/cars");

module.exports = async (req, res) => {
  try {
    const { carNumber } = req.params;

    // Ищем автомобиль в реестре транспорта ГАИ
    const vehicle = await Car.findByPk(carNumber);

    if (!vehicle) {
      return res.json({
        success: false,
        notFound: true,
        message:
          "Автомобиль не числится в реестре ГАИ. Заполните данные владельца вручную.",
      });
    }

    return res.json({
      success: true,
      car: {
        number: vehicle.number,
        ownerName: vehicle.owner_name,
        ownerPhone: vehicle.owner_phone || "Не указан",
        ownerGmail: vehicle.owner_gmail || "Не указан",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
