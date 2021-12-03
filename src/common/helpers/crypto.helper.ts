import { createHash } from "crypto";

export default class CryptoHelper {
  static sha1(raw: string) {
    return createHash("sha1").update(raw).digest("hex");
  }

  static sha256(raw: string) {
    return createHash("sha256").update(raw).digest("hex");
  }

  static generateHash(raw: string) {
    const key = process.env.CRYPTO_KEY || "Netpower";
    return createHash("sha1").update(`${key}${raw}`).digest("hex");
  }

  static generateToken(raw: string) {
    const key = process.env.CRYPTO_KEY || "sha256";
    return createHash("sha256").update(`${key}${raw}`).digest("hex");
  }

  static genCode(n: number): any {
    const add = 1;
    let max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
      return this.genCode(max) + this.genCode(n - max);
    }

    max = Math.pow(10, n + add);
    const min = max / 10; // Math.pow(10, n) basically
    const number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
  }
}
