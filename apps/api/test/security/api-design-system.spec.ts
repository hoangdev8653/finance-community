import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../src/common/constants/error-codes.enum';
import { BusinessException } from '../../src/common/exceptions/business.exception';
import { CorrelationIdMiddleware } from '../../src/common/middleware/correlation-id.middleware';
import { SecurityExceptionFilter } from '../../src/common/filters/security-exception.filter';

describe('Backend API Design System Specifications (BE-08)', () => {
  describe('BusinessException & ErrorCode', () => {
    it('should correctly format response payload with explicit business ErrorCode', () => {
      const exception = new BusinessException(
        ErrorCode.POST_NOT_FOUND,
        'Bài viết không tồn tại hoặc đã bị xóa',
        HttpStatus.NOT_FOUND,
        { slug: 'invalid-slug' },
      );

      const response: any = exception.getResponse();
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.errorCode).toBe(ErrorCode.POST_NOT_FOUND);
      expect(response.code).toBe(ErrorCode.POST_NOT_FOUND);
      expect(response.message).toBe('Bài viết không tồn tại hoặc đã bị xóa');
      expect(response.statusCode).toBe(404);
      expect(response.details).toEqual({ slug: 'invalid-slug' });
    });
  });

  describe('CorrelationIdMiddleware', () => {
    it('should generate a valid UUID v4 when x-request-id header is missing', () => {
      const middleware = new CorrelationIdMiddleware();
      const req: any = { headers: {} };
      const setHeaders: Record<string, string> = {};
      const res: any = {
        setHeader: (key: string, val: string) => {
          setHeaders[key.toLowerCase()] = val;
        },
        writeHead: jest.fn(),
      };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.headers['x-request-id']).toBeDefined();
      expect(setHeaders['x-request-id']).toBe(req.headers['x-request-id']);
      // UUID v4 format verification
      expect(req.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should preserve incoming client x-request-id if provided', () => {
      const middleware = new CorrelationIdMiddleware();
      const clientReqId = 'custom-client-trace-12345';
      const req: any = { headers: { 'x-request-id': clientReqId } };
      const setHeaders: Record<string, string> = {};
      const res: any = {
        setHeader: (key: string, val: string) => {
          setHeaders[key.toLowerCase()] = val;
        },
        writeHead: jest.fn(),
      };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.headers['x-request-id']).toBe(clientReqId);
      expect(setHeaders['x-request-id']).toBe(clientReqId);
    });
  });

  describe('SecurityExceptionFilter Integration', () => {
    it('should attach requestId and code to JSON error payload', () => {
      const filter = new SecurityExceptionFilter();
      const requestId = 'test-trace-uuid-999';

      let jsonPayload: any = null;
      let statusCode = 200;

      const mockResponse: any = {
        status: (code: number) => {
          statusCode = code;
          return mockResponse;
        },
        json: (payload: any) => {
          jsonPayload = payload;
          return mockResponse;
        },
        getHeader: () => null,
      };

      const mockRequest: any = {
        url: '/api/v1/posts/test',
        headers: { 'x-request-id': requestId },
      };

      const mockHost: any = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };

      const exception = new BusinessException(
        ErrorCode.AUTH_ACCOUNT_SUSPENDED,
        'Tài khoản đang bị tạm đình chỉ hoạt động',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockHost);

      expect(statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(jsonPayload).toBeDefined();
      expect(jsonPayload.code).toBe(ErrorCode.AUTH_ACCOUNT_SUSPENDED);
      expect(jsonPayload.requestId).toBe(requestId);
      expect(jsonPayload.path).toBe('/api/v1/posts/test');
      expect(jsonPayload.timestamp).toBeDefined();
    });
  });
});
