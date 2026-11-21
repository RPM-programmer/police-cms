const CryptoHelper = require("../user/CryptoHelper");

// Маппинг грифов секретности в требуемый уровень допуска (1 - высший, 3 - базовый ДСП)
const SECRECY_RANK = {
  dsp: 3,
  secret: 2,
  top_secret: 1,
  special_importance: 1,
};

class KgbService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Создание зашифрованного секретного досье
  async createClassifiedFile({
    secrecyLevel,
    targetType,
    targetId,
    title,
    payload,
    curatorUid,
  }) {
    const fileCode = CryptoHelper.generateCode("KGB");
    const encrypted = CryptoHelper.encryptSecret(payload);

    const file = await this.db.ClassifiedFile.create({
      fileCode,
      secrecyLevel,
      targetType,
      targetId,
      title,
      encryptedPayload: encrypted.encryptedPayload,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      curatorUid,
    });

    await this.db.AuditLog.create({
      actorUid: curatorUid,
      departmentCode: "KGB",
      action: "CLASSIFIED_FILE_CREATED",
      targetTable: "ClassifiedFiles",
      targetRecordId: fileCode,
      afterData: { secrecyLevel, targetType, targetId, title },
    });

    return {
      fileCode: file.fileCode,
      secrecyLevel: file.secrecyLevel,
      title: file.title,
    };
  }

  // Чтение и расшифровка досье с проверкой формы допуска сотрудника
  async readClassifiedFile({ fileCode, officer }) {
    const file = await this.db.ClassifiedFile.findOne({ where: { fileCode } });
    if (!file) throw new Error("Секретный файл не найден");

    const requiredLevel = SECRECY_RANK[file.secrecyLevel] || 1;
    if (
      !officer ||
      officer.departmentCode !== "KGB" ||
      officer.clearanceLevel === 0 ||
      officer.clearanceLevel > requiredLevel
    ) {
      throw new Error(
        `Доступ запрещён: требуется форма допуска №${requiredLevel}`,
      );
    }

    const decryptedData = CryptoHelper.decryptSecret({
      encryptedPayload: file.encryptedPayload,
      iv: file.iv,
      authTag: file.authTag,
    });

    await this.db.AuditLog.create({
      actorUid: officer.citizenUid,
      departmentCode: "KGB",
      action: "CLASSIFIED_FILE_READ",
      targetTable: "ClassifiedFiles",
      targetRecordId: fileCode,
    });

    return {
      fileCode: file.fileCode,
      secrecyLevel: file.secrecyLevel,
      targetType: file.targetType,
      targetId: file.targetId,
      title: file.title,
      data: decryptedData,
      createdAt: file.createdAt,
    };
  }

  // Постановка объекта в оперативную разработку (ОРМ)
  async startSurveillance({
    targetType,
    targetId,
    measures = [],
    warrantNumber,
    curatorUid,
  }) {
    const target = await this.db.SurveillanceTarget.create({
      targetType,
      targetId,
      measures,
      warrantNumber: warrantNumber || null,
      curatorUid,
    });

    await this.db.AuditLog.create({
      actorUid: curatorUid,
      departmentCode: "KGB",
      action: "SURVEILLANCE_STARTED",
      targetTable: "SurveillanceTargets",
      targetRecordId: targetId,
      afterData: { targetType, measures },
    });

    return target;
  }

  // Выдача или отзыв формы допуска к гостайне
  async grantSecurityClearance({
    citizenUid,
    requestedForDept,
    clearanceLevel,
    approvedByUid,
    notes,
  }) {
    const clearance = await this.db.SecurityClearance.create({
      citizenUid,
      requestedForDept,
      clearanceLevel,
      approvedByUid,
      status: "approved",
      notes: notes || null,
    });

    if (this.db.Officer) {
      await this.db.Officer.update(
        { clearanceLevel },
        { where: { citizenUid, departmentCode: requestedForDept } },
      );
    }

    await this.db.AuditLog.create({
      actorUid: approvedByUid,
      departmentCode: "KGB",
      action: "CLEARANCE_GRANTED",
      targetTable: "SecurityClearances",
      targetRecordId: citizenUid,
      afterData: { requestedForDept, clearanceLevel },
    });

    return clearance;
  }

  // Отстранение любого госслужащего от должности (антикоррупционный контроль)
  async suspendOfficer({ badgeNumber, reason, kgbOfficerUid }) {
    const officer = await this.db.Officer.findOne({ where: { badgeNumber } });
    if (!officer) throw new Error("Сотрудник не найден");

    await officer.update({ isSuspended: true, clearanceLevel: 0 });

    await this.db.AuditLog.create({
      actorUid: kgbOfficerUid,
      departmentCode: "KGB",
      action: "OFFICER_SUSPENDED_BY_KGB",
      targetTable: "Officers",
      targetRecordId: badgeNumber,
      afterData: { reason },
    });

    if (this.events)
      this.events.emit("kgb:officer_suspended", { officer, reason });
    return officer;
  }

  // Просмотр журнала аудита всех ведомств
  async getGlobalAuditLogs({ limit = 100, departmentCode = null } = {}) {
    const where = departmentCode ? { departmentCode } : {};
    return this.db.AuditLog.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  // Ввод или снятие режима КТО / ЧП в государстве
  async setSystemState({ mode, reason, activatedByUid }) {
    if (!["normal", "cto", "emergency"].includes(mode)) {
      throw new Error("Режим должен быть normal, cto или emergency");
    }

    const state = await this.db.SystemState.create({
      mode,
      reason: reason || null,
      activatedByUid,
    });

    // Автоматическая публикация экстренного уведомления в ленту новостей
    if (this.db.News && mode !== "normal") {
      await this.db.News.create({
        title: `ЭКСТРЕННОЕ ОПОВЕЩЕНИЕ: Введён режим ${mode.toUpperCase()}`,
        content:
          reason ||
          "По решению КГБ введён особый правовой режим. Границы временно закрыты.",
        departmentCode: "KGB",
        authorUid: activatedByUid,
        isEmergency: true,
      });
    }

    await this.db.AuditLog.create({
      actorUid: activatedByUid,
      departmentCode: "KGB",
      action: "SYSTEM_STATE_CHANGED",
      targetTable: "SystemStates",
      afterData: { mode, reason },
    });

    if (this.events) this.events.emit("kgb:system_state", { state });
    return state;
  }
}

module.exports = KgbService;
