import { AppError, FieldErrorDetail } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected', details?: FieldErrorDetail[]) {
    super(message, HttpStatus.CONFLICT, ErrorCodes.CONFLICT, details);
  }
}
