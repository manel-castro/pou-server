import { CustomError } from "./custom-error";

export class ServerError extends CustomError {
  statusCode: number = 500;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.message }];
  }
}
