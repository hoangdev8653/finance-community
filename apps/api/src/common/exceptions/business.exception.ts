import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes.enum';

export interface BusinessExceptionResponse {
  statusCode: number;
  error: string;
  message: string;
  code: ErrorCode;
  details?: unknown;
}

/**
 * Standardized Business Exception for Finance Community API.
 * Ensures every business-level error contains an explicit ErrorCode enum.
 */
export class BusinessException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;

  constructor(
    errorCode: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    const errorName = HttpStatus[status] || 'Bad Request';
    const responsePayload: BusinessExceptionResponse = {
      statusCode: status,
      error: errorName,
      message,
      code: errorCode,
      ...(details ? { details } : {}),
    };

    super(responsePayload, status);
    this.errorCode = errorCode;
    this.details = details;
  }
}
