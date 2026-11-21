const CryptoHelper = require("../user/CryptoHelper");

class BorderGuardsService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Проверка и фиксация пересечения границы на КПП
  async processBorderCrossing({
    citizenUid,
    citizenPid,
    checkpoint,
    direction,
    vehiclePlate,
    officerUid,
  }) {
    const { Op } = this.db.Sequelize;
    const citizen = await this.db.Citizen.findOne({
      where: {
        [Op.or]: [{ uid: citizenUid || "" }, { pid: citizenPid || "" }],
      },
    });

    if (!citizen) throw new Error("Гражданин с таким UID/PID не найден в базе");

    let decision = "allowed";
    const reasons = [];

    // 1. Проверка режима КТО / ЧП (закрытие границ от КГБ)
    if (this.db.SystemState) {
      const state = await this.db.SystemState.findOne({
        order: [["id", "DESC"]],
      });
      if (state && state.mode !== "normal") {
        decision = "denied";
        reasons.push(
          `Граница закрыта: введён режим ${state.mode.toUpperCase()}`,
        );
      }
    }

    // 2. Проверка федерального розыска и статуса
    if (citizen.isWanted || citizen.isArrested) {
      decision = "detained";
      reasons.push("Гражданин числится в розыске или под арестом");
    }

    // 3. Проверка активного стоп-листа (BorderBan)
    const activeBan = await this.db.BorderBan.findOne({
      where: { targetUid: citizen.uid, isActive: true },
    });
    if (activeBan) {
      if (
        activeBan.banType === "full_block" ||
        (activeBan.banType === "exit_ban" && direction === "exit") ||
        (activeBan.banType === "entry_ban" && direction === "entry")
      ) {
        if (decision !== "detained") decision = "denied";
        reasons.push(
          `Стоп-лист (${activeBan.initiatedByDept}): ${activeBan.reason}`,
        );
      }
    }

    // 4. Проверка авто на угон (если пересекает на транспорте)
    if (vehiclePlate && this.db.Vehicle) {
      const vehicle = await this.db.Vehicle.findOne({
        where: { plateNumber: vehiclePlate.toUpperCase() },
      });
      if (vehicle && (vehicle.isStolen || vehicle.isIntercepted)) {
        decision = "detained";
        reasons.push(
          `Транспорт ${vehicle.plateNumber} в угоне или ориентировке ГАИ`,
        );
      }
    }

    const crossing = await this.db.BorderCrossing.create({
      citizenUid: citizen.uid,
      citizenPid: citizen.pid,
      checkpoint,
      direction,
      vehiclePlate: vehiclePlate ? vehiclePlate.toUpperCase() : null,
      officerUid,
      decision,
      notes: reasons.length ? reasons.join("; ") : "Нарушений не выявлено",
    });

    if (decision !== "allowed" && this.events) {
      this.events.emit("border:alert", { citizen, crossing, reasons });
    }

    return { crossing, decision, reasons };
  }

  // Наложение запрета на въезд/выезд
  async addBorderBan({
    targetUid,
    banType,
    initiatedByDept = "border_guards",
    reason,
    validUntil,
    officerUid,
  }) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid: targetUid },
    });
    if (!citizen) throw new Error("Гражданин не найден");

    const ban = await this.db.BorderBan.create({
      targetUid: citizen.uid,
      targetPid: citizen.pid,
      banType,
      initiatedByDept,
      reason,
      validUntil: validUntil || null,
      isActive: true,
    });

    await citizen.update({ travelBanned: true });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: initiatedByDept,
      action: "BORDER_BAN_ADDED",
      targetTable: "BorderBans",
      targetRecordId: targetUid,
      afterData: { banType, reason },
    });

    return ban;
  }

  // Выдача визы / ВНЖ / пропуска в погранзону
  async issueMigrationPermit({ citizenUid, type, validUntil, issuedByUid }) {
    const permitNumber = CryptoHelper.generateCode("MIG");
    return this.db.MigrationPermit.create({
      permitNumber,
      citizenUid,
      type,
      validUntil,
      issuedByUid,
    });
  }

  // Таможенная декларация на груз компании
  async submitCustomsDeclaration({
    companyCid,
    cargoDescription,
    declaredValue,
    dutyAmount = 0,
  }) {
    const declarationNumber = CryptoHelper.generateCode("CUST");
    return this.db.CustomsDeclaration.create({
      declarationNumber,
      companyCid,
      cargoDescription,
      declaredValue,
      dutyAmount,
    });
  }
}

module.exports = BorderGuardsService;
