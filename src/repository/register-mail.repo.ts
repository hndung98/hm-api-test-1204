import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800
export default class RegisterMailRepo {
  static table = "register-mail";

  static getMailSync(mail: string) {
    const cache = new NodeCache(RegisterMailRepo.table);
    return cache.getOne(mail);
  }

  static async getMail(email: string) {
    const cache = new NodeCache(RegisterMailRepo.table);
    return await cache.getOne(email);
  }

  static async setMailCode(email: string, code: string) {
    const cache = new NodeCache(RegisterMailRepo.table);
    const data = {
      email,
      code
    }
    cache.saveOne(data, 'email', TIMEOUT);
    return true;
  }

  static async deleteMailCode(email: string) {
    const cache = new NodeCache(RegisterMailRepo.table);
    cache.deleteOne(email);
    return true;

  }
}
