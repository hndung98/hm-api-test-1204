export class ObjectUtils {
  static removeEmpty(obj: any) {
    Object.keys(obj).forEach((k) => obj[k] == null && delete obj[k]);
    return obj;
  }

  static groupKeyAndCount(obj: any) {
    return obj.reduce((total: any, value: string) => {
      total[value] = (total[value] || 0) + 1;
      return total;
    }, {});
  }

  static sortObject(obj: any, keep?: number) {
    const sortable = [];
    for (const item in obj) {
      sortable.push([item, obj[item]]);
    }

    sortable.sort((a, b) => {
      return b[1] - a[1];
    });
    return sortable
      .map((item: any[]) => ({ label: item[0], value: item[1] }))
      .slice(0, keep);
  }
}
