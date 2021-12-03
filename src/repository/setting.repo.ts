import fs from 'fs';
import prisma from "../common/helpers/prisma.helper";
import NodeCache from "../common/classes/node.cache.class";

export default class SettingsRepo {
  static table = "Setting";

  static async getSettings() {
    const cache = new NodeCache(SettingsRepo.table);
    return await cache.fetchAllKeyColumn('key');
  }

  static getSettingSync(key: string) {
    const cache = new NodeCache(SettingsRepo.table);
    return cache.getOne(key);
  }

  static async getSetting(key: string) {
    const cache = new NodeCache(SettingsRepo.table);
    return await cache.fetchOne(key, 'key');
  }

  static async setSetting(key: string, value: string,
    title: string, description?: string, enabled: boolean = true) {

    const record = await prisma.setting
      .upsert({
        where: { key },
        create: {
          key, value, title, description, enabled,
        },
        update: {
          value, title, description, enabled,
        },
      }).catch((error) => ({ error: error.message }));

    if ((record as any).error) return record;

    const cache = new NodeCache(SettingsRepo.table);
    cache.saveOne(record, 'key');
    return record;
  }

  static async importEnviroment() {
    try {
      const env = fs.readFileSync(`.env`).toString();
      const envKeys = Object.keys(process.env).filter(k => env.includes(`${k}=`));

      const cache = new NodeCache(SettingsRepo.table);
      const dbSettings = await cache.fetchAllKeyColumn('key');
      const dbKeys = dbSettings.map((e: any) => e.key);

      const newKeys = envKeys.filter(k => !dbKeys.includes(k));

      if (newKeys.length != 0) {
        const data: any = [];
        cache.deleteOne(`%keys`);

        newKeys.map(k => data.push({
          key: k,
          value: process.env[k],
          title: k,
        }))

        return await prisma.setting.createMany({ data });
      }

      return true;
    } catch (error) {
      return { error: error.message };
    }
  }
}
