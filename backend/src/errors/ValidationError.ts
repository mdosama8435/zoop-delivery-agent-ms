import { AppError, FieldErrorDetail } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export class ValidationError extends AppError {
  constructor(message = 'Input validation failed', details?: FieldErrorDetail[]) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_FAILED, details);
  }
}
