export default class StringUtils {
  static toCamelCase(input: string) {
    const inputs = input.split(/\s/);
    let sb = "";
    inputs.forEach((s) => {
      if (s.length == 1) {
        sb += (sb.length != 0 ? " " : "") + s.toUpperCase();
      } else if (s.length > 1) {
        sb +=
          (sb.length != 0 ? " " : "") +
          s.substring(0, 1).toUpperCase() +
          s.substring(1).toLowerCase();
      }
    });
    if (input.slice(-1) == " ") sb += " ";
    return sb.toString();
  }

  static getShortenedText(text: string) {
    if (text == null) return "";
    let short = "";
    const words = text.split(" ");
    words.forEach((word) => {
      if (short.length >= 3) return false;
      const letter = word.substring(0, 1);
      if (
        !(letter >= "A" && letter <= "Z") &&
        !(letter >= "a" && letter <= "z")
      )
        return false;
      short += letter.toUpperCase();
    });
    return short;
  }

  static formatCurrency(number: number, withoutZeroMantissa: boolean) {
    let numStr = "" + number;
    const parts = numStr.split(".");
    numStr = parts[0];
    let end = numStr.length;
    let formattedNum = "";

    while (end > 0) {
      formattedNum =
        numStr.substring(end - 3, end) +
        (formattedNum.length != 0 ? "," : "") +
        formattedNum;
      end -= 3;
    }
    return (
      formattedNum +
      (parts.length > 1 ? "." + parts[1] : withoutZeroMantissa ? "" : ".00")
    );
  }

  static toUSCurrency(amount: string) {
    amount = amount.replace(/[^0-9.]/g, "").replace(/^0+/, "");
    if (!amount) {
      amount = "0";
    } else if (amount.indexOf(".") == 0) {
      amount = "0" + amount;
    }
    if (amount.indexOf(".") > 0) {
      const floating = amount.substring(amount.indexOf(".")).replace(/\./g, "");
      amount = amount.split(".")[0] + "." + floating.substring(0, 2);
    }
    return amount;
  }

  static extensionFromUrl(url: string) {
    const path = url.replace(/(http(s)?:\/\/[^\/]+)|(\?.+)/g, "");
    let ext =
      path && path.indexOf("/") >= 0
        ? path.substring(path.lastIndexOf("/"))
        : "";
    if (ext.indexOf("$") > 0) ext = ext.substring(0, ext.indexOf("$"));
    ext = ext.indexOf(".") > 0 ? ext.substring(ext.lastIndexOf(".")) : "";
    return ext;
  }

  static isImageResource(url: string) {
    const lowerURL = url.toLowerCase();
    return lowerURL.indexOf(".png") > 0 ||
      lowerURL.indexOf(".jpg") > 0 ||
      lowerURL.indexOf(".gif") > 0 ||
      lowerURL.indexOf(".bmp") > 0 ||
      lowerURL.indexOf(".svg") > 0
      ? true
      : false;
  }

  static isJsCssResource(url: string) {
    return url.indexOf(".css") > 0 ||
      url.indexOf("/css") > 0 ||
      url.indexOf(".js") > 0
      ? true
      : false;
  }

  static upperCaseFirstLetter(text: string) {
    if (typeof text !== "string") return "";
    return text
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/(\B)[^ ]*/g, (match) => match.toLowerCase())
      .replace(/^[^ ]/g, (match) => match.toUpperCase());
  }
}
