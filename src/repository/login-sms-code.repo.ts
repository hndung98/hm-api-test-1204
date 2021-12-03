import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class LoginSmsRepo {
  static table = "login-sms";

  static getcodeSync(phoneNumber: string) {
    const cache = new NodeCache(LoginSmsRepo.table);
    return cache.getOne(phoneNumber);
  }

  static async getCode(phoneNumber: string) {
    const cache = new NodeCache(LoginSmsRepo.table);
    return await cache.getOne(phoneNumber);
  }

  static async setCode(phoneNumber: string, code: string) {
    const cache = new NodeCache(LoginSmsRepo.table);
    const data = {
      phoneNumber,
      code
    }
    cache.saveOne(data, 'phoneNumber', TIMEOUT);
    return true;
  }

  static async deleteCode(phoneNumber: string) {
    const cache = new NodeCache(LoginSmsRepo.table);
    cache.deleteOne(phoneNumber);
    return true;

  }
}
