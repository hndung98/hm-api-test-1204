import { User } from ".prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import moment from "moment";
import CryptoHelper from "./crypto.helper";

const secretKey = process.env.SECRET_KEY || "";
const secretRefreshKey = process.env.SECRET_REFRESH_KEY || "";
const tokenLife = process.env.TOKEN_LIFE || 0;

export default class TokenHelper {
  static genCode6() {
    const hex = crypto.randomBytes(3).toString("hex");
    const codes = Array(hex.length)
      .fill(0)
      .map((v, index) => hex.charCodeAt(index) % 10);
    return codes.join("");
  }

  static createToken(data: any) {
    return TokenHelper.create(data, secretKey, tokenLife);
  }

  static createEmailToken(data: any) {
    return TokenHelper.create(data, secretKey + "email", 1800);
  }

  static verifyToken(token: any): any {
    return TokenHelper.verify(token, secretKey);
  }

  static verifyEmailToken(token: any): any {
    return TokenHelper.verify(token, secretKey + "email");
  }

  private static create(data: any, secretKey: any, expiresIn: any) {
    try {
      const token = jwt.sign(
        { ...data, iat: Math.floor(Date.now() / 1000) },
        secretKey,
        { expiresIn: parseInt(expiresIn) }
      );
      return token;
    } catch (error) {
      return { error: "Invalid credentials" };
    }
  }

  private static verify(token: any, secretKey: any) {
    try {
      const data: any = jwt.verify(token, secretKey);

      const result: any = TokenHelper.validateExpiration(data);
      if (!result || result.error) {
        return result;
      }

      if (data.id) return data;
      return { error: "Invalid credentials" };
    } catch (error) {
      return { error: (error as any).message };
    }
  }

  static createSessionToken(user: any) {
    const expiration = moment()
      .add(process.env.TOKEN_LIFE, "seconds")
      .toString();

    const tokenData = {
      id: user.id,
      email: user.email,
      role: user.role,
      accessKey: user.accessKey,
      expiration,
      nonce: TokenHelper.generateNonce(expiration),
    };

    return TokenHelper.createToken(tokenData);
  }

  static generateNonce(data: string) {
    return CryptoHelper.generateHash(moment().hours + data);
  }

  static validateExpiration(data: any) {
    if (!data) return false;

    const { expiration, nonce } = data;
    if (expiration && nonce) {
      const hash = TokenHelper.generateNonce(expiration);
      if (hash != nonce || moment() > moment(new Date(expiration))) {
        return { error: "Invalid credentials" };
      }
    }
    return true;
  }
}
