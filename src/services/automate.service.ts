import fs from "fs";
import prisma from "../common/helpers/prisma.helper";
import { Req } from "../common/types/api.type";
import CryptoHelper from "../common/helpers/crypto.helper";
import LocalizationRepo from "../repository/localization.repo";
import DynamicContentRepo from "../repository/dynamic.content.repo";
import UserService from "./user.service";
import ProvinceService from "./province.service";

export default class Automate {
  static async index({ query }: Req) {
    const { env, secret } = query;
    if (env == "staging") {
      if (secret == CryptoHelper.sha1(process.env.SECRET_KEY as any)) {
        fs.writeFile(
          "automate.lock",
          new Date().toUTCString(),
          { encoding: "utf8", flag: "w+" },
          () => { }
        );
        return true;
      }
    }
    return false;
  }

  static async initPgSqlEarthDistance() {
    try {
      await prisma.$queryRaw(`CREATE EXTENSION cube;`);
      await prisma.$queryRaw(`CREATE EXTENSION earthdistance;`);
      return true;
    } catch (error) {
      return { error: (error as any).message };
    }
  }

  static async initStaging() {
    try {
      await UserService.init();
      await LocalizationRepo.importFromJSON();
      await DynamicContentRepo.importPrivacy();
      await DynamicContentRepo.importTermsAndConditions();
      await ProvinceService.init()
      return true;
    } catch (error) {
      return { error: (error as any).message };
    }
  }
}
