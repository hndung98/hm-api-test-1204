import cache from "../helpers/node.cache.helper";
import prisma from "../helpers/prisma.helper";

export default class NodeReCache {
  prefix = "";

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  keys() {
    return cache.keys();
  }

  getStats() {
    return cache.getStats();
  }

  flushAllCache() {
    cache.flushAll();
  }

  setOne(id: any, value: any, raw?: boolean) {
    cache.set(raw ? id : `${this.prefix}:${id}`, value);
  }

  setMany(data: Array<{ id: any; val: any; ttl?: number }>, raw?: boolean) {
    cache.mset(
      data.map((e) => {
        const { id, val, ttl } = e;
        return { key: raw ? id : `${this.prefix}:${id}`, val, ttl };
      })
    );
  }

  saveOne(record: any, column?: string, timeout?: number) {
    console.log(record);

    const key = column && Object.keys(record).includes(column) ? record[column] : record.id;
    console.log(key);

    cache.set(`${this.prefix}:${key}`, record, timeout ?? 0);
  }

  saveMany(records: Array<any>) {
    cache.mset(
      records.map((record) => {
        return { key: `${this.prefix}:${record.id}`, val: record };
      })
    );
  }

  async updateOne(id: any) {
    await this.deleteOne(id);
    await this.fetchOne(id);
  }

  async updateMany(ids: Array<any>) {
    await this.deleteMany(ids);
    await this.fetchMany(ids);
  }

  getOne(id: any, raw?: boolean) {
    return cache.get(raw ? id : `${this.prefix}:${id}`);
  }

  getMany(ids: Array<any>, asArray?: boolean, raw?: boolean) {
    const records = cache.mget(
      raw ? ids : ids.map((id) => `${this.prefix}:${id}`)
    );
    if (raw) return records;

    const dict: any = {};
    Object.keys(records).map((k: string) => {
      const key = k.replace(`${this.prefix}:`, "");
      dict[key] = records[k];
    });

    return asArray ? Object.keys(dict).map((k) => dict[k]) : dict;
  }

  async fetchOne(id: any, column?: string) {
    const val = this.getOne(id);

    if (!val) {
      const query = `SELECT * FROM "${this.prefix}" WHERE "${column ?? 'id'}"='${id}' LIMIT 1`;
      const records = await prisma.$queryRaw(query);

      if (records && Array.isArray(records)) {
        const data = records[0];
        if (data) this.saveOne(data, column);
        return data;
      }
    }

    return val;
  }

  async fetchMany(ids: Array<any>, asArray?: boolean, column?: string, table?: string) {
    const vals = this.getMany(ids);
    const foundIds = Object.keys(vals);
    const notFoundIds: Array<any> = ids.filter(
      (id) => foundIds.indexOf(`${id}`) < 0
    );

    if (notFoundIds && notFoundIds.length > 0) {
      const query = `SELECT * FROM "${table || this.prefix}" WHERE "${column ?? 'id'}" IN ('${notFoundIds.join("','")}')`;
      const records = await prisma.$queryRaw(query);

      if (records && Array.isArray(records)) {
        records.map((e: any) => {
          this.saveOne(e, column);
          vals[e.id] = e;
        });
      }
    }

    return asArray ? Object.keys(vals).map((k) => vals[k]) : vals;
  }

  async fetchAll(asArray?: boolean, table?: string) {
    let ids = this.getOne("all") as any;

    if (!ids) {
      const query = `SELECT id FROM "${table || this.prefix}"`;
      const records = await prisma.$queryRaw(query);

      ids = records.map((e: any) => e.id);
      this.setOne("all", ids);
    }

    const vals = await this.fetchMany(ids);
    return asArray ? Object.keys(vals).map((k) => vals[k]) : vals;
  }

  async fetchAllKeyColumn(column: string, table?: string) {
    const keyAll = `%${column}s`;
    let keys: any = this.getOne(keyAll);

    if (!keys) {
      const query = `SELECT ${column} FROM "${table || this.prefix}"`;
      const records = await prisma.$queryRaw(query);

      keys = records.map((e: any) => e[column]);
      this.setOne(keyAll, keys);
    }

    return await this.fetchMany(keys, true, column);
  }

  deleteOne(id: any, raw?: boolean) {
    cache.del(raw ? id : `${this.prefix}:${id}`);
  }

  deleteMany(ids: Array<any>, raw?: boolean) {
    cache.del(raw ? ids : ids.map((id) => `${this.prefix}:${id}`));
  }
}
