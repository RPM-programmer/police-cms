const requireRole = (allowedPositions = []) => {
  return (req, res, next) => {
    // Если мидлвар checkAuth не отработал или не нашел юзера
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Запрос отклонен: Отсутствуют данные авторизации.",
      });
    }

    // КРИТИЧЕСКИЙ ТОКЕН ДОСТУПА: Глобальный админ игнорирует должностные проверки
    if (req.user.role === "admin") {
      return next();
    }

    // Если для роута важна конкретная должность, а у сотрудника её нет
    if (
      allowedPositions.length > 0 &&
      !allowedPositions.includes(req.user.position)
    ) {
      return res.status(403).json({
        success: false,
        error: `ДОСТУП ЗАПРЕЩЕН. Данное действие доступно только для должностей: [${allowedPositions.join(", ")}]. Ваша текущая позиция: ${req.user.position || "Обычный гражданин"}`,
      });
    }

    // Если проверка пройдена успешно
    next();
  };
};

module.exports = requireRole;
