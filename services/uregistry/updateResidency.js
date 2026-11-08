const User = require("../../models/uregistry/user");
const Home = require("../../models/uregistry/homes");

module.exports = async (req, res) => {
  try {
    const { uid, homeId } = req.body;

    const targetHome = await Home.findByPk(homeId);
    if (!targetHome)
      return res
        .status(404)
        .json({
          success: false,
          error: "Указанный адрес недвижимости не найден в реестре.",
        });

    const fullAddress = `${targetHome.city}, ул. ${targetHome.street}, д. ${targetHome.house}`;
    await User.update({ home: fullAddress }, { where: { id: uid } });

    return res.json({
      success: true,
      message: `Гражданину успешно изменена прописка на адрес: ${fullAddress}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
