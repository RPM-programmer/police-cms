const Institution = require("../../models/inspect/institutions");
const Check = require("../../models/inspect/checks");
const { Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    // Находим проверки со статусом "Нарушения не устранены"
    const problematicChecks = await Check.findAll({
      where: { status: "Нарушения не устранены" },
      attributes: ["institutionId"],
    });

    const badIds = problematicChecks.map((c) => c.institutionId);

    // Находим все заведения, которые имеют проблемы или вообще еще ни разу не проверялись
    const pendingList = await Institution.findAll({
      where: {
        [Op.or]: [
          { id: badIds },
          sequelize.literal(
            `NOT EXISTS (SELECT 1 FROM inspect_checks WHERE inspect_checks.institution_id = Institution.id)`,
          ),
        ],
      },
    });

    return res.json({ success: true, list: pendingList });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
