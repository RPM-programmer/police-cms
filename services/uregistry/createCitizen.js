const User = require("../../models/uregistry/user");
const Passport = require("../../models/uregistry/passports");

module.exports = async (req, res) => {
  try {
    const {
      id,
      name,
      surname,
      patronymic,
      gmail,
      phone,
      passportNumber,
      sid,
      gender,
      wasBorn,
      region,
      photoUrl,
    } = req.body;

    // Проверяем уникальность UID
    const exists = await User.findByPk(id);
    if (exists)
      return res
        .status(400)
        .json({
          success: false,
          error: "Гражданин с таким UID уже существует.",
        });

    // 1. Создаем пользователя в Едином Регистре
    await User.create({
      id,
      name,
      surname,
      patronymic,
      gmail,
      phone,
      role: "гражданин",
      passportId: passportNumber, // Номер паспорта служит паролем
    });

    // 2. Оформляем паспортный бланк
    await Passport.create({
      sid,
      uid: id,
      pid: passportNumber,
      name,
      surname,
      gender,
      wasBorn,
      region,
      photoUrl,
      auth: true,
    });

    return res.json({
      success: true,
      message: `Гражданин ${name} ${surname} успешно зарегистрирован в государстве. Выдан паспорт №${passportNumber}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
