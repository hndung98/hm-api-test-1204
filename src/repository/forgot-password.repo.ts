import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class ForgotPasswordRepo {
  static table = "forgot-password";

  static getCodeSync(id: number) {
    const cache = new NodeCache(ForgotPasswordRepo.table);
    return cache.getOne(id);
  }

  static async getCode(id: number) {
    const cache = new NodeCache(ForgotPasswordRepo.table);
    return await cache.getOne(id);
  }

  static async setCode(id: number, code: string) {
    const cache = new NodeCache(ForgotPasswordRepo.table);
    const data = {
      id,
      code
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async deleteCode(id: number) {
    const cache = new NodeCache(ForgotPasswordRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
