const CryptoHelper = require("../user/CryptoHelper");

class SecurityService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Постановка объекта под пультовую охрану
  async registerGuardedObject({
    name,
    address,
    ownerType,
    ownerId,
    assignedUnit,
    officerUid,
  }) {
    const objectCode = CryptoHelper.generateCode("OBJ");
    const obj = await this.db.GuardedObject.create({
      objectCode,
      name,
      address,
      ownerType,
      ownerId,
      assignedUnit: assignedUnit || null,
    });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "security",
      action: "OBJECT_GUARD_REGISTERED",
      targetTable: "GuardedObjects",
      targetRecordId: objectCode,
      afterData: { name, ownerId },
    });

    return obj;
  }

  // Срабатывание тревожной кнопки / сигнализации и выезд ГБР
  async triggerAlarm({ objectCode, crewName }) {
    const obj = await this.db.GuardedObject.findOne({ where: { objectCode } });
    if (!obj) throw new Error("Охраняемый объект не найден");

    await obj.update({ alarmStatus: "alarm_triggered" });

    const incident = await this.db.AlarmIncident.create({
      objectCode,
      crewName: crewName || obj.assignedUnit || "ГБР-1",
      status: crewName ? "dispatched" : "active",
    });

    if (this.events)
      this.events.emit("security:alarm_triggered", { object: obj, incident });
    return incident;
  }

  // Выдача лицензии на оружие (с проверкой отсутствия розыска и судимостей)
  async issueWeaponLicense({
    holderType = "citizen",
    holderId,
    category,
    expiresAt,
    issuedByUid,
  }) {
    if (holderType === "citizen") {
      const citizen = await this.db.Citizen.findOne({
        where: { uid: holderId, status: "active" },
      });
      if (!citizen) throw new Error("Гражданин не найден");
      if (citizen.isWanted || citizen.criminalRecordsCount > 0) {
        throw new Error(
          "Отказ в лицензии: гражданин в розыске или имеет судимость",
        );
      }
    }

    const licenseNumber = CryptoHelper.generateCode("WLIC");
    const license = await this.db.WeaponLicense.create({
      licenseNumber,
      holderType,
      holderId,
      category,
      issuedByUid,
      expiresAt,
    });

    await this.db.AuditLog.create({
      actorUid: issuedByUid,
      departmentCode: "security",
      action: "WEAPON_LICENSE_ISSUED",
      targetTable: "WeaponLicenses",
      targetRecordId: licenseNumber,
      afterData: { holderId, category },
    });

    return license;
  }

  // Регистрация оружия в пулегильзотеке
  async registerWeapon({
    serialNumber,
    model,
    caliber,
    ownerUid,
    licenseNumber,
    officerUid,
  }) {
    const license = await this.db.WeaponLicense.findOne({
      where: { licenseNumber, holderId: ownerUid, status: "active" },
    });
    if (!license) throw new Error("Действующая лицензия на оружие не найдена");

    const ballisticCode = CryptoHelper.generateCode("BAL");
    const weapon = await this.db.WeaponRegistry.create({
      serialNumber: serialNumber.toUpperCase(),
      model,
      caliber,
      ownerUid,
      licenseNumber,
      ballisticCode,
    });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "security",
      action: "WEAPON_REGISTERED",
      targetTable: "WeaponRegistries",
      targetRecordId: weapon.serialNumber,
      afterData: { ownerUid, ballisticCode },
    });

    return weapon;
  }

  // Выдача электронного пропуска СКУД на режимный объект
  async issueSecurityPass({
    citizenUid,
    facilityName,
    accessLevel = 1,
    validUntil,
    issuedByUid,
  }) {
    const passCode = CryptoHelper.generateCode("PASS");
    const pass = await this.db.SecurityPass.create({
      passCode,
      citizenUid,
      facilityName,
      accessLevel,
      validUntil,
      issuedByUid,
    });

    await this.db.AuditLog.create({
      actorUid: issuedByUid,
      departmentCode: "security",
      action: "SECURITY_PASS_ISSUED",
      targetTable: "SecurityPasses",
      targetRecordId: passCode,
      afterData: { citizenUid, facilityName, accessLevel },
    });

    return pass;
  }
}

module.exports = SecurityService;
