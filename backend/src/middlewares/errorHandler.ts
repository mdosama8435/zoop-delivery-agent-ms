import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { ResponseUtil } from '../utils/response.util';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';
import { env } from '../config/env.config';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = res.locals.requestId as string | undefined;

  // 1. Handled Domain & Application Errors
  if (err instanceof AppError) {
    ResponseUtil.error(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // 2. Malformed JSON Body Error (Express body-parser)
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    ResponseUtil.error(
      res,
      'Malformed JSON payload received in request body',
      HttpStatus.BAD_REQUEST,
      ErrorCodes.MALFORMED_JSON
    );
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta?.target as string[]).join(', ')
        : (err.meta?.target as string) || 'unique field';

      ResponseUtil.error(
        res,
        `An agent with this ${target} already exists`,
        HttpStatus.CONFLICT,
        ErrorCodes.CONFLICT,
        [{ field: String(target), issue: `Value for ${target} must be unique` }]
      );
      return;
    }

    // Record to update or delete does not exist
    if (err.code === 'P2025') {
      ResponseUtil.error(
        res,
        'Delivery agent not found or has already been removed',
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
      return;
    }
  }

  // 4. Uncaught / Unexpected Server Errors
  console.error(`[UNHANDLED ERROR] [${requestId || 'no-id'}]:`, err);

  const message = env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred'
    : err.message || 'An unexpected internal server error occurred';

  ResponseUtil.error(
    res,
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCodes.INTERNAL_SERVER_ERROR
  );
}
