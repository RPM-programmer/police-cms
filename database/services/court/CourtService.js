const CryptoHelper = require("../user/CryptoHelper");

class CourtService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Подача иска или передача уголовного дела в Суд
  async fileCourtCase({
    category,
    sourceCaseNumber,
    plaintiffId,
    defendantId,
    summary,
  }) {
    const docketNumber = CryptoHelper.generateCode("CRT");
    const courtCase = await this.db.CourtCase.create({
      docketNumber,
      category,
      sourceCaseNumber: sourceCaseNumber || null,
      plaintiffId,
      defendantId,
      summary,
    });

    if (this.events) this.events.emit("court:case_filed", { courtCase });
    return courtCase;
  }

  // Запрос ордера (от Милиции, КГБ или Инспекции)
  async requestWarrant({
    type,
    targetType,
    targetId,
    requestedByDept,
    requestedByUid,
    grounds,
  }) {
    const warrantNumber = CryptoHelper.generateCode("WRT");
    const warrant = await this.db.CourtWarrant.create({
      warrantNumber,
      type,
      targetType,
      targetId,
      requestedByDept,
      requestedByUid,
      grounds,
    });

    if (this.events) this.events.emit("court:warrant_requested", { warrant });
    return warrant;
  }

  // Одобрение или отклонение ордера судьёй (с автоматическим применением ограничений)
  async reviewWarrant({ warrantNumber, decision, judgeUid, validHours = 72 }) {
    if (!["approved", "rejected"].includes(decision)) {
      throw new Error("Решение по ордеру должно быть approved или rejected");
    }

    const warrant = await this.db.CourtWarrant.findOne({
      where: { warrantNumber },
    });
    if (!warrant) throw new Error("Ордер не найден");

    const validUntil =
      decision === "approved"
        ? new Date(Date.now() + validHours * 3600 * 1000)
        : null;
    const digitalSignature =
      decision === "approved"
        ? `JUDGE-${judgeUid}-${CryptoHelper.randomDigits(8)}`
        : null;

    await warrant.update({
      status: decision,
      judgeUid,
      validUntil,
      digitalSignature,
    });

    // Автоматическое исполнение санкции при одобрении
    if (decision === "approved") {
      if (
        warrant.type === "asset_freeze" &&
        warrant.targetType === "company" &&
        this.db.Company
      ) {
        await this.db.Company.update(
          { isFrozen: true },
          { where: { cid: warrant.targetId } },
        );
      }
      if (
        warrant.type === "travel_ban" &&
        warrant.targetType === "citizen" &&
        this.db.Citizen
      ) {
        const citizen = await this.db.Citizen.findOne({
          where: { uid: warrant.targetId },
        });
        if (citizen) {
          await citizen.update({ travelBanned: true });
          if (this.db.BorderBan) {
            await this.db.BorderBan.create({
              targetUid: citizen.uid,
              targetPid: citizen.pid,
              banType: "exit_ban",
              initiatedByDept: "court",
              reason: `Судебный ордер ${warrantNumber}`,
              validUntil,
            });
          }
        }
      }
    }

    await this.db.AuditLog.create({
      actorUid: judgeUid,
      departmentCode: "court",
      action: `WARRANT_${decision.toUpperCase()}`,
      targetTable: "CourtWarrants",
      targetRecordId: warrantNumber,
      afterData: { decision, targetId: warrant.targetId, type: warrant.type },
    });

    return warrant;
  }

  // Вынесение приговора и авто-исполнение наказаний
  async issueVerdict({
    docketNumber,
    judgeUid,
    verdictType,
    punishment = {},
    resolutionText,
  }) {
    const courtCase = await this.db.CourtCase.findOne({
      where: { docketNumber },
    });
    if (!courtCase) throw new Error("Судебное дело не найдено");

    const verdictNumber = CryptoHelper.generateCode("VRD");
    const verdict = await this.db.CourtVerdict.create({
      verdictNumber,
      docketNumber,
      judgeUid,
      verdictType,
      punishment,
      resolutionText,
    });

    await courtCase.update({ status: "verdict_issued", judgeUid });

    // Исполнительный лист при обвинительном приговоре
    if (verdictType === "guilty") {
      const citizen = await this.db.Citizen.findOne({
        where: { uid: courtCase.defendantId },
      });
      if (citizen) {
        await citizen.update({
          criminalRecordsCount: citizen.criminalRecordsCount + 1,
          isArrested: Boolean(punishment.prisonDays),
        });
      }
      if (punishment.revokeLicense && this.db.DriverLicense) {
        await this.db.DriverLicense.update(
          { status: "revoked" },
          { where: { citizenUid: courtCase.defendantId } },
        );
      }
      if (punishment.freezeCompany && this.db.Company) {
        await this.db.Company.update(
          { status: "liquidated", isFrozen: true },
          { where: { cid: courtCase.defendantId } },
        );
      }
    }

    await this.db.AuditLog.create({
      actorUid: judgeUid,
      departmentCode: "court",
      action: "COURT_VERDICT_ISSUED",
      targetTable: "CourtVerdicts",
      targetRecordId: verdictNumber,
      afterData: { docketNumber, verdictType, punishment },
    });

    if (this.events)
      this.events.emit("court:verdict_issued", { courtCase, verdict });
    return verdict;
  }
}

module.exports = CourtService;
