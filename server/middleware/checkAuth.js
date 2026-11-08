const User = require("../../models/uregistry/user");

module.exports = async (req, res, next) => {
  try {
    // Получаем UID из кастомного заголовка сессии фронтенда
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        error:
          "Доступ заблокирован: Требуется авторизация в Едином Паспортном Столе.",
      });
    }

    // Ищем гражданина в SQLite базе данных
    const citizen = await User.findByPk(userId);
    if (!citizen) {
      return res.status(401).json({
        success: false,
        error:
          "Ошибка безопасности: Данный UID не зарегистрирован в базе данных государства.",
      });
    }

    // Записываем актуальный служебный профиль в объект запроса
    req.user = {
      id: citizen.id,
      name: citizen.name,
      surname: citizen.surname,
      role: citizen.role, // 'admin' или 'гражданин'
      work: citizen.work, // 'ГАИ', 'Милиция', 'КГБ', 'Охрана' и т.д.
      position: citizen.position, // Конкретный системный идентификатор должности
    };

    // Передаем управление дальше — роутеру или следующему мидлвару
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Критический сбой шлюза аутентификации: " + err.message,
    });
  }
};
