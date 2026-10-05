import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';
import { FieldErrorDetail } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SuccessMeta {
  timestamp: string;
  cached?: boolean;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: SuccessMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: FieldErrorDetail[];
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export class ResponseUtil {
  public static success<T>(
    res: Response,
    data: T,
    statusCode: HttpStatusCode = HttpStatus.OK,
    options?: {
      cached?: boolean;
      pagination?: PaginationMeta;
    }
  ): Response {
    const requestId = res.locals.requestId as string | undefined;

    const envelope: ApiSuccessEnvelope<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        cached: options?.cached ?? false,
        ...(requestId ? { requestId } : {}),
        ...(options?.pagination ? { pagination: options.pagination } : {}),
      },
    };

    if (options?.cached !== undefined) {
      res.setHeader('X-Cache', options.cached ? 'HIT' : 'MISS');
    }

    return res.status(statusCode).json(envelope);
  }

  public static empty(res: Response, statusCode: HttpStatusCode = HttpStatus.NO_CONTENT): Response {
    return res.status(statusCode).send();
  }

  public static error(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = 'INTERNAL_SERVER_ERROR',
    details?: FieldErrorDetail[]
  ): Response {
    const requestId = res.locals.requestId as string | undefined;

    const envelope: ApiErrorEnvelope = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId ? { requestId } : {}),
      },
    };

    return res.status(statusCode).json(envelope);
  }
}
