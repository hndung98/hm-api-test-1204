export class NumberUtils {
  static isPositiveInteger(number: number) {
    return number ? number === number >>> 0 : false;
  }

  static isNonNegativeInteger(number: number) {
    return number ? number === number >>> 0 : true;
  }
}
