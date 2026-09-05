import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@InjectableCatch()
@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SecurityExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'Internal Server Error';
    let message = 'An unexpected security or server error occurred.';
    let code = 'INTERNAL_ERROR';
    let extraFields: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();

      if (typeof resBody === 'string') {
        message = resBody;
      } else if (typeof resBody === 'object' && resBody !== null) {
        const bodyObj = resBody as Record<string, any>;
        message = bodyObj.message || exception.message;
        errorName = bodyObj.error || exception.name;
        code = bodyObj.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR');
        
        const { statusCode, error, message: _m, code: _c, ...rest } = bodyObj;
        extraFields = rest;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    // Mask sensitive details in production environments
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'An internal server error occurred.';
    }

    const rawReqId = request.headers['x-request-id'] || response.getHeader('x-request-id');
    const requestId = typeof rawReqId === 'string' ? rawReqId : Array.isArray(rawReqId) ? rawReqId[0] : undefined;

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      code,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...extraFields,
    });
  }
}

function InjectableCatch(): ClassDecorator {
  return (target: any) => target;
}
