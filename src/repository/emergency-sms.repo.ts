import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class EmergencySmsRepo {
  static table = "emergency-sms";

  static getDataSync(id: string) {
    const cache = new NodeCache(EmergencySmsRepo.table);
    return cache.getOne(id);
  }

  static async getData(id: string) {
    const cache = new NodeCache(EmergencySmsRepo.table);
    return await cache.getOne(id);
  }

  static async setData(id: string, count: number) {
    const cache = new NodeCache(EmergencySmsRepo.table);
    const data = {
      id,
      time: new Date(),
      count
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }


  static async deleteCode(id: string) {
    const cache = new NodeCache(EmergencySmsRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
