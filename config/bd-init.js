const sequelize = require("./db");
const log = require("custom-color-logs").print;
require("../models/uregistry/user");
require("../models/uregistry/passports");
require("../models/uregistry/homes");
require("../models/uregistry/works");
require("../models/tpolice/workers");
require("../models/tpolice/cars");
require("../models/tpolice/fines");
require("../models/tpolice/fine-standart");
require("../models/tpolice/rooms");
require("../models/tpolice/evacuations");
require("../models/police/workers");
require("../models/police/calls");
require("../models/police/protocols");
require("../models/police/arrests");
require("../models/police/orientations");
require("../models/security_guard/workers");
require("../models/security_guard/contracts");
require("../models/security_guard/objects");
require("../models/security_guard/alarms");
require("../models/court/workers");
require("../models/court/courts");
require("../models/court/history");
require("../models/court/solutions");
require("../models/border/workers");
require("../models/border/posts");
require("../models/border/migration");
require("../models/border/permits");
require("../models/border/neighbours");
require("../models/inspect/workers");
require("../models/inspect/institutions");
require("../models/inspect/checks");
require("../models/inspect/licenses");
require("../models/sequrity/workers");
require("../models/sequrity/affairs");
require("../models/sequrity/suspects");
require("../models/sequrity/searches");
async function initDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    if (log && log.ServerGovInfo) {
      console.log(
        log.ServerGovInfo(
          "Все 29 таблиц баз данных POLICE-CMS успешно синхронизированы в gov_system.db.",
        ),
      );
    } else {
      console.log(
        "Все 29 таблиц баз данных POLICE-CMS успешно синхронизированы в gov_system.db.",
      );
    }
  } catch (error) {
    console.error(
      "Критический сбой авторегистрации и синхронизации моделей БД SQLite:",
      error,
    );
    throw error;
  }
}
module.exports = initDatabase;
