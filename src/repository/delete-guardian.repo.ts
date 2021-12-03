import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class DeleteGuardianRepo {
  static table = "delete-guardian";

  static getCodeSync(id: string) {
    const cache = new NodeCache(DeleteGuardianRepo.table);
    return cache.getOne(id);
  }

  static async getCode(id: string) {
    const cache = new NodeCache(DeleteGuardianRepo.table);
    return await cache.getOne(id);
  }

  static async setCode(id: string, code: string) {
    const cache = new NodeCache(DeleteGuardianRepo.table);
    const data = {
      id,
      code
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async deleteCode(id: string) {
    const cache = new NodeCache(DeleteGuardianRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
