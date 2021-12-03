export const Errors: any = {
  200: "Success",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Invalid Credentials",
  404: "Not Found",
  422: "Invalid resources",
  500: "Internal Server Error",
  501: "Not Implemented",
  503: "Service Unavailable",
};

export default class ErrorHelper {
  static error(message: any) {
    return {
      error: typeof message == "string" ? message : JSON.stringify(message),
    };
  }

  static code(code: any) {
    const message = Errors[code] ?? "Internal error";
    return ErrorHelper.error(message);
  }
}
