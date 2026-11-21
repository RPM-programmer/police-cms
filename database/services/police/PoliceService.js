const CryptoHelper = require("../user/CryptoHelper");

class PoliceService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Вызов 102
  async createEmergencyCall({
    callerUid,
    location,
    description,
    priority = "medium",
  }) {
    const callCode = CryptoHelper.generateCode("102");
    const call = await this.db.EmergencyCall.create({
      callCode,
      callerUid: callerUid || null,
      location,
      description,
      priority,
    });
    if (this.events) this.events.emit("police:call102", { call });
    return call;
  }

  async assignCrewToCall({ callCode, crewName, officerUid }) {
    const call = await this.db.EmergencyCall.findOne({ where: { callCode } });
    if (!call) throw new Error("Вызов не найден");
    await call.update({ assignedCrew: crewName, status: "dispatched" });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "police",
      action: "CALL102_DISPATCHED",
      targetTable: "EmergencyCalls",
      targetRecordId: callCode,
      afterData: { assignedCrew: crewName },
    });
    return call;
  }

  // Заявление КУСП
  async registerCrimeReport({ applicantUid, suspectUid, description }) {
    const reportNumber = CryptoHelper.generateCode("KUSP");
    return this.db.CrimeReport.create({
      reportNumber,
      applicantUid,
      suspectUid: suspectUid || null,
      description,
    });
  }

  // Возбуждение уголовного дела + улики и участники
  async openCriminalCase({
    title,
    article,
    investigatorUid,
    departmentCode = "police",
    summary,
  }) {
    const caseNumber = CryptoHelper.generateCode("CASE");
    const criminalCase = await this.db.CriminalCase.create({
      caseNumber,
      title,
      article,
      investigatorUid,
      departmentCode,
      summary,
    });

    await this.db.AuditLog.create({
      actorUid: investigatorUid,
      departmentCode,
      action: "CRIMINAL_CASE_OPENED",
      targetTable: "CriminalCases",
      targetRecordId: caseNumber,
      afterData: { title, article },
    });
    return criminalCase;
  }

  async addCaseParticipant({
    caseNumber,
    citizenUid,
    role,
    testimony,
    officerUid,
  }) {
    const participant = await this.db.CaseParticipant.create({
      caseNumber,
      citizenUid,
      role,
      testimony: testimony || null,
    });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "police",
      action: "CASE_PARTICIPANT_ADDED",
      targetTable: "CaseParticipants",
      targetRecordId: String(participant.id),
      afterData: { caseNumber, citizenUid, role },
    });
    return participant;
  }

  async addCaseEvidence({
    caseNumber,
    title,
    description,
    photoUrl,
    collectedByUid,
  }) {
    return this.db.CaseEvidence.create({
      caseNumber,
      title,
      description,
      photoUrl: photoUrl || null,
      collectedByUid,
    });
  }

  // Задержание и помещение в ИВС (по умолчанию на 48 часов)
  async detainCitizen({
    citizenUid,
    officerUid,
    reason,
    seizedItems = [],
    hours = 48,
  }) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid: citizenUid },
    });
    if (!citizen) throw new Error("Гражданин не найден");

    const detainedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    const record = await this.db.DetentionRecord.create({
      citizenUid,
      officerUid,
      reason,
      seizedItems,
      detainedUntil,
    });

    await citizen.update({ isArrested: true });
    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "police",
      action: "CITIZEN_DETAINED",
      targetTable: "DetentionRecords",
      targetRecordId: String(record.id),
      afterData: { citizenUid, detainedUntil },
    });

    return record;
  }

  // Объявление в розыск (автоматически ставит стоп-лист в Погранслужбе и метку на авто в ГАИ)
  async declareWanted({
    targetUid,
    initiatedByDept = "police",
    initiatorUid,
    article,
    reason,
    dangerLevel = "medium",
    photoSketchUrl,
  }) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid: targetUid },
    });
    if (!citizen) throw new Error("Гражданин не найден");

    const wanted = await this.db.WantedPerson.create({
      targetUid,
      initiatedByDept,
      initiatorUid,
      article,
      reason,
      dangerLevel,
      photoSketchUrl: photoSketchUrl || null,
    });

    await citizen.update({ isWanted: true, travelBanned: true });

    // Авто-блокировка выезда на границе
    if (this.db.BorderBan) {
      await this.db.BorderBan.create({
        targetUid: citizen.uid,
        targetPid: citizen.pid,
        banType: "exit_ban",
        initiatedByDept,
        reason: `Федеральный розыск (${article})`,
        isActive: true,
      });
    }

    // Авто-маячок перехвата "Поток" на все авто разыскиваемого
    if (this.db.Vehicle) {
      await this.db.Vehicle.update(
        { isIntercepted: true },
        { where: { ownerType: "citizen", ownerId: targetUid } },
      );
    }

    await this.db.AuditLog.create({
      actorUid: initiatorUid,
      departmentCode: initiatedByDept,
      action: "WANTED_DECLARED",
      targetTable: "WantedPeople",
      targetRecordId: targetUid,
      afterData: { article, dangerLevel },
    });

    if (this.events) this.events.emit("citizen:wanted", { citizen, wanted });
    return wanted;
  }

  // Дактилоскопия и ДНК
  async recordForensics({
    citizenUid,
    fingerprintHash,
    dnaCode,
    recordedByUid,
  }) {
    const [record] = await this.db.ForensicData.upsert({
      citizenUid,
      fingerprintHash,
      dnaCode,
      recordedByUid,
    });
    return record;
  }
}

module.exports = PoliceService;
