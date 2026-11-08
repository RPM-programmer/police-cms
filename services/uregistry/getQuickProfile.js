const User = require("../../models/uregistry/user");
const Passport = require("../../models/uregistry/passports");

module.exports = async (req, res) => {
  try {
    const { uid } = req.params;

    const citizen = await User.findOne({
      where: { id: uid },
      include: [
        {
          model: Passport,
          as: "passportProfile",
          attributes: ["photoUrl", "pid", "gender"],
        },
      ],
    });

    if (!citizen) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Гражданин с таким UID не зарегистрирован.",
        });
    }

    return res.json({
      success: true,
      profile: {
        uid: citizen.id,
        fullName:
          `${citizen.surname} ${citizen.name} ${citizen.patronymic || ""}`.trim(),
        phone: citizen.phone || "Не указан",
        gmail: citizen.gmail || "Не указан",
        home: citizen.home || "Нет прописки",
        work: citizen.work || "Безработный",
        position: citizen.position || "Нет",
        photoUrl: citizen.passportProfile
          ? citizen.passportProfile.photoUrl
          : null,
        passportNumber: citizen.passportProfile
          ? citizen.passportProfile.pid
          : "Нет паспорта",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
