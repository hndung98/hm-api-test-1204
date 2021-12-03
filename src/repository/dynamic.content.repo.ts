import fs from "fs";
import prisma from "../common/helpers/prisma.helper";

export default class DynamicContentRepo {
  static table = "DynamicContent";

  static async importPrivacy() {
    try {
      const raw: string = fs.readFileSync("src/static/privacy.html", {
        encoding: "utf8",
      });

      return await this.setPrivacy(0, "Privacy Policy", raw);
    } catch (error) {
      return { error: error.message };
    }
  }

  static async importTermsAndConditions() {
    try {
      const raw: string = fs.readFileSync("src/static/terms.conditions.html", {
        encoding: "utf8",
      });

      return await this.setTermsAndConditions(0, "Terms and Conditions", raw);
    } catch (error) {
      return { error: error.message };
    }
  }

  static async setPrivacy(id: number, title: string, content: string) {
    const privacy =
      id == 0
        ? null
        : await prisma.dynamicContent.findFirst({
            where: {
              id,
              type: "PRIVACY_POLICY",
            },
          });

    const data: any = {
      type: "PRIVACY_POLICY",
      key: "privacy",
      title,
      content,
    };

    if (privacy) {
      return await prisma.dynamicContent.update({
        where: { id },
        data,
      });
    } else {
      return await prisma.dynamicContent.create({ data });
    }
  }

  static async setTermsAndConditions(
    id: number,
    title: string,
    content: string
  ) {
    const terms =
      id == 0
        ? null
        : await prisma.dynamicContent.findFirst({
            where: {
              id,
              type: "TERM_OF_USE",
            },
          });

    const data: any = {
      type: "TERM_OF_USE",
      key: "terms",
      title,
      content,
    };

    if (terms) {
      return await prisma.dynamicContent.update({
        where: { id },
        data,
      });
    } else {
      return await prisma.dynamicContent.create({ data });
    }
  }
}
