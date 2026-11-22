const CryptoHelper = require("./CryptoHelper");
const { Op } = require("sequelize");
class AuthService {
  constructor({ db, events }) {
    this.db = db;
    this.events = events;
  }

  // Регистрация человека (проверка пароля регистратора -> возвращает success, uid, pid и введённые данные)
  async registerCitizen(payload, registrarUid = null) {
    const {
      registrarPassword,
      firstName,
      lastName,
      middleName,
      phone,
      email,
      birthDate,
      password,
    } = payload;

    if (!CryptoHelper.verifyRegistrarPassword(registrarPassword)) {
      return { success: false, error: "Неверный пароль регистратора" };
    }

    const { Op } = this.db.Sequelize;
    const existing = await this.db.Citizen.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    if (existing) {
      return {
        success: false,
        error: "Гражданин с таким телефоном или почтой уже зарегистрирован",
      };
    }

    const uid = CryptoHelper.generateUID();
    const pid = CryptoHelper.generatePID();
    const passwordHash = await CryptoHelper.hashPassword(password || pid);

    const citizen = await this.db.Citizen.create({
      uid,
      pid,
      firstName,
      lastName,
      middleName: middleName || null,
      phone,
      email,
      birthDate,
      passwordHash,
      registeredByUid: registrarUid,
    });

    await this.db.AuditLog.create({
      actorUid: registrarUid,
      action: "CITIZEN_REGISTERED",
      targetTable: "Citizens",
      targetRecordId: citizen.uid,
      afterData: {
        uid: citizen.uid,
        pid: citizen.pid,
        fullName: `${lastName} ${firstName}`,
      },
    });

    if (this.events) this.events.emit("citizen:registered", { citizen });

    return {
      success: true,
      uid: citizen.uid,
      pid: citizen.pid,
      citizen: {
        firstName: citizen.firstName,
        lastName: citizen.lastName,
        middleName: citizen.middleName,
        phone: citizen.phone,
        email: citizen.email,
        birthDate: citizen.birthDate,
      },
    };
  }

  // Подача заявки на регистрацию компании (проверка связки UID + PID учредителя)
  async registerCompany(payload) {
    const { ownerUid, ownerPid, companyName, phone, email, initialCapital } =
      payload;

    const owner = await this.db.Citizen.findOne({
      where: { uid: ownerUid, pid: ownerPid, status: "active" },
    });

    if (!owner) {
      return {
        success: false,
        error: "Гражданин с указанными UID и PID не найден или заблокирован",
      };
    }

    if (owner.isWanted || owner.isArrested) {
      return {
        success: false,
        error: "Отказ: учредитель находится в розыске или под арестом",
      };
    }

    const duplicate = await this.db.Company.findOne({
      where: { name: companyName },
    });
    if (duplicate) {
      return {
        success: false,
        error: "Компания с таким названием уже существует",
      };
    }

    const cid = CryptoHelper.generateCID();
    const company = await this.db.Company.create({
      cid,
      name: companyName,
      ownerUid: owner.uid,
      ownerPid: owner.pid,
      phone,
      email,
      initialCapital: Number(initialCapital) || 0,
      currentBalance: Number(initialCapital) || 0,
      status: "pending",
    });

    await this.db.AuditLog.create({
      actorUid: owner.uid,
      action: "COMPANY_REQUEST_SUBMITTED",
      targetTable: "Companies",
      targetRecordId: company.cid,
      afterData: {
        cid: company.cid,
        name: company.name,
        initialCapital: company.initialCapital,
      },
    });

    if (this.events) this.events.emit("company:requested", { company, owner });

    return {
      success: true,
      cid: company.cid,
      status: company.status,
      company: {
        name: company.name,
        ownerUid: company.ownerUid,
        ownerPid: company.ownerPid,
        phone: company.phone,
        email: company.email,
        initialCapital: company.initialCapital,
      },
    };
  }

  async login({ login, password } = {}) {
    const cleanLogin = String(login || "").trim();
    const cleanPassword = String(password || "").trim();

    if (!cleanLogin || !cleanPassword) {
      return { success: false, error: "Введите логин и пароль" };
    }

    const citizen = await this.db.Citizen.findOne({
      where: {
        [Op.or]: [
          { uid: cleanLogin },
          { pid: cleanLogin },
          { email: cleanLogin },
        ],
      },
    });

    if (!citizen) {
      return {
        success: false,
        error: `Пользователь "${cleanLogin}" не найден`,
      };
    }

    if (citizen.status !== "active") {
      return {
        success: false,
        error: `Доступ закрыт (статус: ${citizen.status})`,
      };
    }

    const isMatch = await CryptoHelper.verifyPassword(
      cleanPassword,
      citizen.passwordHash,
    );
    if (!isMatch) {
      return { success: false, error: "Неверный пароль" };
    }

    const officer = await this.db.Officer.findOne({
      where: { citizenUid: citizen.uid, isSuspended: false },
      include: this.db.DepartmentRank
        ? [{ model: this.db.DepartmentRank, as: "rank" }]
        : [],
    });

    return {
      success: true,
      user: {
        uid: citizen.uid,
        pid: citizen.pid,
        firstName: citizen.firstName,
        lastName: citizen.lastName,
        middleName: citizen.middleName,
        officer: officer || null,
      },
    };
  }
}

module.exports = AuthService;
