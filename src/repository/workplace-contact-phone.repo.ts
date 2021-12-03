import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class WorkplaceContactPhoneRepo {
  static table = "workplace-contact-phone";

  static getCodeSync(id: string) {
    const cache = new NodeCache(WorkplaceContactPhoneRepo.table);
    return cache.getOne(id);
  }

  static async getCode(id: string) {
    const cache = new NodeCache(WorkplaceContactPhoneRepo.table);
    return await cache.getOne(id);
  }

  static async setCode(id: string, code: string, phoneNumber: string) {
    const cache = new NodeCache(WorkplaceContactPhoneRepo.table);
    const data = {
      id,
      code,
      phoneNumber
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async deleteCode(id: string) {
    const cache = new NodeCache(WorkplaceContactPhoneRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
