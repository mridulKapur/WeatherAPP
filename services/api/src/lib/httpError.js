export class HttpError extends Error {
  constructor(status, error, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.error = error;
    this.details = details;
  }
}

