import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Check if error originates from PostgreSQL driver / Drizzle ORM
    const pgCode = exception?.code || exception?.originalError?.code;

    if (pgCode) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'A database error occurred.';
      let errorCode = 'DATABASE_ERROR';

      switch (pgCode) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = 'A resource with duplicate unique attributes already exists.';
          errorCode = 'RESOURCE_ALREADY_EXISTS';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced entity constraint invalid.';
          errorCode = 'INVALID_FOREIGN_KEY';
          break;
        case '23502': // not_null_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Required database field cannot be null.';
          errorCode = 'NOT_NULL_VIOLATION';
          break;
        case 'ECONNREFUSED':
        case '57P01':
        case '08006':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Database connection temporarily unavailable.';
          errorCode = 'DATABASE_UNAVAILABLE';
          break;
      }

      this.logger.error(`Database Exception [${pgCode}]: ${exception.message}`, exception.stack);

      return response.status(status).json({
        statusCode: status,
        error: status === 409 ? 'Conflict' : status === 400 ? 'Bad Request' : 'Service Unavailable',
        message,
        code: errorCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Pass through if not a PG database error
    const status = exception.status || 500;
    response.status(status).json({
      statusCode: status,
      error: exception.name || 'Internal Server Error',
      message: exception.message || 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
