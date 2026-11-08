const Alarm = require("../../models/security_guard/alarms");
const GuardObject = require("../../models/security_guard/objects");

module.exports = async (req, res) => {
  try {
    const { objectId, geoCoordinates } = req.body;

    // Проверяем, существует ли охраняемый объект
    const targetObject = await GuardObject.findByPk(objectId);
    if (!targetObject) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Объект не числится на пульте охраны.",
        });
    }

    // Тревога работает только если объект стоит на сигнализации
    if (targetObject.alarmSystemStatus !== "На охране") {
      return res
        .status(400)
        .json({
          success: false,
          error: "Сигнализация на объекте отключена владельцем.",
        });
    }

    const now = new Date();
    const timeString =
      now.toLocaleTimeString() + " " + now.toLocaleDateString();

    const newAlarm = await Alarm.create({
      objectId,
      triggerTime: timeString,
      type: "Кнопка ПАНИКА",
      status: "Тревога",
    });

    return res.json({
      success: true,
      message:
        "КРИТИЧЕСКАЯ ТРЕВОГА! Сигнал отправлен на пульт. Группа Задержания выехала.",
      alarmId: newAlarm.id,
      coordinates: geoCoordinates || targetObject.address,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
