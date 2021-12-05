import fs from "fs";

export default class LocalizationRepo {
  static table = "Localization";

  static async importFromJSON() {
    try {
      const raw: string = fs.readFileSync("src/static/country-codes.js", {
        encoding: "utf8",
      });
      const codes = JSON.parse(raw);
      const data = codes.map((e: any) => ({
        countryCode: e.countryCode,
        flag: e.flag,
        dialCode: e.dialCode,
        country: e.name,
        enableLanguage: e.countryCode == "US",
      }));

    } catch (error: any) {
      return { error: error.message };
    }
  }
}
