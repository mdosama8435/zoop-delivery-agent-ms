import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';
import { ErrorCode, ErrorCodes } from '../constants/errorCodes';

export interface FieldErrorDetail {
  field: string;
  issue: string;
}

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errorCode: ErrorCode;
  public readonly details?: FieldErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR,
    details?: FieldErrorDetail[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
