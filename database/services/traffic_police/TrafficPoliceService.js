const CryptoHelper = require("../user/CryptoHelper");

class TrafficPoliceService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Регистрация транспорта (МРЭО)
  async registerVehicle({
    vin,
    plateNumber,
    brand,
    model,
    color,
    ownerType,
    ownerId,
    officerUid,
  }) {
    const vehicle = await this.db.Vehicle.create({
      vin: vin.toUpperCase(),
      plateNumber: plateNumber.toUpperCase(),
      brand,
      model,
      color,
      ownerType,
      ownerId,
    });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "traffic_police",
      action: "VEHICLE_REGISTERED",
      targetTable: "Vehicles",
      targetRecordId: vehicle.vin,
      afterData: { plateNumber: vehicle.plateNumber, ownerId },
    });

    return vehicle;
  }

  // Пробив ТС по госномеру или VIN (включая сработку системы «Поток»)
  async inspectVehicle(query) {
    const { Op } = this.db.Sequelize;
    const vehicle = await this.db.Vehicle.findOne({
      where: {
        [Op.or]: [
          { plateNumber: query.toUpperCase() },
          { vin: query.toUpperCase() },
        ],
      },
    });
    if (!vehicle) return null;

    if ((vehicle.isStolen || vehicle.isIntercepted) && this.events) {
      this.events.emit("traffic_police:potok_alert", { vehicle });
    }
    return vehicle;
  }

  // Выдача водительского удостоверения
  async issueDriverLicense({ citizenUid, categories = ["B"], officerUid }) {
    const citizen = await this.db.Citizen.findOne({
      where: { uid: citizenUid, status: "active" },
    });
    if (!citizen) throw new Error("Гражданин не найден");

    const licenseNumber = CryptoHelper.generateCode("DL");
    const license = await this.db.DriverLicense.create({
      licenseNumber,
      citizenUid,
      categories,
      issuedByUid: officerUid,
    });

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "traffic_police",
      action: "DRIVER_LICENSE_ISSUED",
      targetTable: "DriverLicenses",
      targetRecordId: licenseNumber,
      afterData: { citizenUid, categories },
    });

    return license;
  }

  // Выписка штрафа ПДД + начисление штрафных баллов (при 15 баллах — авто-приостановка ВУ)
  async issueFine({
    citizenUid,
    plateNumber,
    article,
    amount,
    pointsAdded = 0,
    officerUid,
  }) {
    const fineNumber = CryptoHelper.generateCode("FINE");
    const fine = await this.db.TrafficFine.create({
      fineNumber,
      citizenUid,
      plateNumber: plateNumber ? plateNumber.toUpperCase() : null,
      article,
      amount,
      pointsAdded,
      officerUid,
    });

    if (pointsAdded > 0 && this.db.DriverLicense) {
      const license = await this.db.DriverLicense.findOne({
        where: { citizenUid },
      });
      if (license) {
        const totalPoints = license.penaltyPoints + Number(pointsAdded);
        const updates = { penaltyPoints: totalPoints };
        if (totalPoints >= 15 && license.status === "valid") {
          updates.status = "suspended";
        }
        await license.update(updates);
      }
    }

    await this.db.AuditLog.create({
      actorUid: officerUid,
      departmentCode: "traffic_police",
      action: "TRAFFIC_FINE_ISSUED",
      targetTable: "TrafficFines",
      targetRecordId: fineNumber,
      afterData: { citizenUid, amount, pointsAdded },
    });

    if (this.events) this.events.emit("traffic_police:fine_issued", { fine });
    return fine;
  }

  // Оформление ДТП
  async registerAccident({
    location,
    participants = [],
    description,
    schemeUrl,
    inspectorUid,
  }) {
    const accidentCode = CryptoHelper.generateCode("DTP");
    return this.db.TrafficAccident.create({
      accidentCode,
      location,
      participants,
      description,
      schemeUrl: schemeUrl || null,
      inspectorUid,
    });
  }

  // Эвакуация на штрафстоянку
  async impoundVehicle({ vin, plateNumber, reason, impoundLot, officerUid }) {
    const vehicle = await this.db.Vehicle.findOne({
      where: { vin: vin.toUpperCase() },
    });
    if (vehicle) await vehicle.update({ isImpounded: true });

    return this.db.VehicleImpound.create({
      vin: vin.toUpperCase(),
      plateNumber: plateNumber.toUpperCase(),
      reason,
      impoundLot,
      officerUid,
    });
  }
}

module.exports = TrafficPoliceService;
