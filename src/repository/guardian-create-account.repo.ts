import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class GuardianCreateAccountRepo {
  static table = "guardian-create-account";

  static getCodeSync(id: string) {
    const cache = new NodeCache(GuardianCreateAccountRepo.table);
    return cache.getOne(id);
  }

  static async getCode(id: string) {
    const cache = new NodeCache(GuardianCreateAccountRepo.table);
    return await cache.getOne(id);
  }

  static async setCodewithPhoneNumber(id: string, code: string, phoneNumber: string) {
    const cache = new NodeCache(GuardianCreateAccountRepo.table);
    const data = {
      id,
      code,
      phoneNumber
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async setCodewithEmail(id: string, code: string, email: string) {
    const cache = new NodeCache(GuardianCreateAccountRepo.table);
    const data = {
      id,
      code,
      email
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async deleteCode(id: string) {
    const cache = new NodeCache(GuardianCreateAccountRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
