const Orientation = require("../../models/police/orientations");
const User = require("../../models/uregistry/user");
const Passport = require("../../models/uregistry/passports");

module.exports = async (req, res) => {
  try {
    const list = await Orientation.findAll({
      where: { status: "В розыске" },
      include: [
        {
          model: User,
          as: "wantedCitizen",
          attributes: ["name", "surname", "patronymic"],
          include: [
            {
              model: Passport,
              as: "passportProfile",
              attributes: ["photoUrl", "pid"],
            },
          ],
        },
      ],
    });

    return res.json({ success: true, list });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
