import { AppError, FieldErrorDetail } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', details?: FieldErrorDetail[]) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCodes.BAD_REQUEST, details);
  }
}
