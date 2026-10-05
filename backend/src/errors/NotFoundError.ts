import { AppError } from './AppError';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource not found') {
    super(message, HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
  }
}
