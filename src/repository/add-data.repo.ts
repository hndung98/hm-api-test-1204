import NodeCache from "../common/classes/node.cache.class";

const TIMEOUT = 1800

type AddDataType = {
  code?: string,
  email?: string,
  password?: string,
  phoneNumber?: string
}

export default class AddDataRepo {
  static table = "add-data";

  static getCodeSync(id: number) {
    const cache = new NodeCache(AddDataRepo.table);
    return cache.getOne(id);
  }

  static async getCode(id: number) {
    const cache = new NodeCache(AddDataRepo.table);
    return await cache.getOne(id);
  }

  static async setCode(id: number, values: AddDataType) {
    const cache = new NodeCache(AddDataRepo.table);
    const data = {
      id,
      ...values
    }
    cache.saveOne(data, 'id', TIMEOUT);
    return true;
  }

  static async deleteCode(id: number) {
    const cache = new NodeCache(AddDataRepo.table);
    cache.deleteOne(id);
    return true;

  }
}
