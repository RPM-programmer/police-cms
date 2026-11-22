const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // вместо require('bcrypt')

class CryptoHelper {
  static randomDigits(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max).toString();
  }

  static generateUID() {
    return `UID-${this.randomDigits(6)}`;
  }

  static generatePID() {
    const letters = "ABCEHKMOPTX";
    const prefix =
      letters[crypto.randomInt(0, letters.length)] +
      letters[crypto.randomInt(0, letters.length)];
    return `${prefix}-${this.randomDigits(7)}`;
  }

  static generateCID() {
    return `CID-${this.randomDigits(6)}`;
  }

  static generateCode(prefix = "DOC") {
    const year = new Date().getFullYear();
    return `${prefix.toUpperCase()}-${year}-${this.randomDigits(6)}`;
  }

  static async hashPassword(plainPassword) {
    return bcrypt.hash(String(plainPassword), 10);
  }

  static async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(String(plainPassword), hash);
  }

  static verifyRegistrarPassword(inputPassword) {
    const expected =
      process.env.POLICE_CMS_REGISTRAR_PASSWORD || "admin-registrar";
    const a = Buffer.from(String(inputPassword || ""));
    const b = Buffer.from(String(expected));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  // Шифрование секретных архивов КГБ (AES-256-GCM)
  static encryptSecret(data) {
    const keyHex =
      process.env.POLICE_CMS_KGB_ENCRYPTION_KEY ||
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const key = Buffer.from(keyHex, "hex");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedPayload: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  // Расшифровка архивов КГБ
  static decryptSecret({ encryptedPayload, iv, authTag }) {
    const keyHex =
      process.env.POLICE_CMS_KGB_ENCRYPTION_KEY ||
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const key = Buffer.from(keyHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(iv, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPayload, "hex")),
      decipher.final(),
    ]);
    return JSON.parse(decrypted.toString("utf8"));
  }
}

module.exports = CryptoHelper;
