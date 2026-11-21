const CryptoHelper = require("../user/CryptoHelper");

class InspectionService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Список заявок компаний на рассмотрении
  async getPendingCompanies() {
    return this.db.Company.findAll({
      where: { status: "pending" },
      order: [["createdAt", "ASC"]],
    });
  }

  // Одобрение или отклонение заявки на регистрацию компании
  async reviewCompanyRegistration({
    cid,
    decision,
    activityType,
    reviewComment,
    inspectorUid,
  }) {
    if (!["approved", "rejected"].includes(decision)) {
      throw new Error("Решение должно быть approved или rejected");
    }

    const company = await this.db.Company.findOne({ where: { cid } });
    if (!company) throw new Error("Компания с таким CID не найдена");

    await company.update({
      status: decision,
      activityType: activityType || company.activityType,
      reviewedByUid: inspectorUid,
      reviewComment: reviewComment || null,
    });

    await this.db.AuditLog.create({
      actorUid: inspectorUid,
      departmentCode: "InspectionMinistry",
      action: `COMPANY_${decision.toUpperCase()}`,
      targetTable: "Companies",
      targetRecordId: cid,
      afterData: { status: decision, reviewComment },
    });

    if (this.events) this.events.emit(`company:${decision}`, { company });
    return company;
  }

  // Выдача государственной лицензии бизнесу
  async issueBusinessLicense({
    companyCid,
    activityCategory,
    expiresAt,
    issuedByUid,
  }) {
    const company = await this.db.Company.findOne({
      where: { cid: companyCid, status: "approved" },
    });
    if (!company) throw new Error("Действующая компания не найдена");

    const licenseNumber = CryptoHelper.generateCode("BLIC");
    const license = await this.db.BusinessLicense.create({
      licenseNumber,
      companyCid,
      activityCategory,
      issuedByUid,
      expiresAt,
    });

    await this.db.AuditLog.create({
      actorUid: issuedByUid,
      departmentCode: "InspectionMinistry",
      action: "BUSINESS_LICENSE_ISSUED",
      targetTable: "BusinessLicenses",
      targetRecordId: licenseNumber,
      afterData: { companyCid, activityCategory },
    });

    return license;
  }

  // Назначение и фиксация итогов проверки компании
  async recordInspection({
    companyCid,
    inspectionType,
    inspectorUid,
    findings,
    fineAmount = 0,
    status,
  }) {
    const checkNumber = CryptoHelper.generateCode("INSP");
    const check = await this.db.InspectionCheck.create({
      checkNumber,
      companyCid,
      inspectionType,
      inspectorUid,
      findings: findings || null,
      fineAmount,
      status,
    });

    await this.db.AuditLog.create({
      actorUid: inspectorUid,
      departmentCode: "InspectionMinistry",
      action: "INSPECTION_RECORDED",
      targetTable: "InspectionChecks",
      targetRecordId: checkNumber,
      afterData: { companyCid, status, fineAmount },
    });

    return check;
  }

  // Выдача предписания (с возможностью приостановки работы компании)
  async issuePrescription({
    checkNumber,
    companyCid,
    requirements,
    deadline,
    suspendOperations = false,
    inspectorUid,
  }) {
    const prescriptionNumber = CryptoHelper.generateCode("PRES");
    const prescription = await this.db.InspectionPrescription.create({
      prescriptionNumber,
      checkNumber,
      companyCid,
      requirements,
      deadline,
      suspendOperations: Boolean(suspendOperations),
    });

    if (suspendOperations && this.db.Company) {
      await this.db.Company.update(
        { status: "suspended" },
        { where: { cid: companyCid } },
      );
    }

    await this.db.AuditLog.create({
      actorUid: inspectorUid,
      departmentCode: "InspectionMinistry",
      action: "PRESCRIPTION_ISSUED",
      targetTable: "InspectionPrescriptions",
      targetRecordId: prescriptionNumber,
      afterData: { companyCid, suspendOperations },
    });

    return prescription;
  }

  // Госзакупки и тендеры
  async createTender({ customerDept, title, budget, creatorUid }) {
    const tenderCode = CryptoHelper.generateCode("TEND");
    return this.db.StateTender.create({
      tenderCode,
      customerDept,
      title,
      budget,
    });
  }
}

module.exports = InspectionService;
