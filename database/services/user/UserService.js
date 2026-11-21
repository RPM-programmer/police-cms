const CryptoHelper = require("./CryptoHelper");

class UserService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Полный профиль гражданина для личного кабинета и ведомств
  async getCitizenDossier(uid) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid },
      attributes: { exclude: ["passwordHash"] },
      include: [
        { model: this.db.Company, as: "companies" },
        { model: this.db.Officer, as: "positions" },
      ],
    });
    return citizen;
  }

  // Приём гражданина на службу в ведомство
  async hireOfficer({
    targetUid,
    departmentCode,
    rankId,
    division,
    clearanceLevel = 0,
    hiredByUid,
  }) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid: targetUid, status: "active" },
    });
    if (!citizen) throw new Error("Гражданин не найден");
    if (citizen.isWanted || citizen.criminalRecordsCount > 0) {
      throw new Error("Кандидат имеет судимость или находится в розыске");
    }

    const badgeNumber = CryptoHelper.generateCode(departmentCode);
    const officer = await this.db.Officer.create({
      badgeNumber,
      citizenUid: targetUid,
      departmentCode,
      rankId,
      division: division || null,
      clearanceLevel,
      hiredByUid,
    });

    await this.db.AuditLog.create({
      actorUid: hiredByUid,
      departmentCode,
      action: "OFFICER_HIRED",
      targetTable: "Officers",
      targetRecordId: badgeNumber,
      afterData: officer.toJSON(),
    });

    if (this.events) this.events.emit("officer:hired", { officer });
    return officer;
  }

  // Получение данных ведомства для публичного портала home.html
  async getDepartmentPortal(departmentCode) {
    return this.db.Department.findOne({ where: { code: departmentCode } });
  }
}

module.exports = UserService;
