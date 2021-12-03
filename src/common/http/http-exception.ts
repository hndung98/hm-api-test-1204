export default class HttpException extends Error {
  statusCode?: number;
  status?: number;
  error: string | null;

  constructor(statusCode: number, error?: string) {
    super(error);

    this.statusCode = statusCode;
    this.error = error || null;
  }
}
