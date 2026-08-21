import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from '../../src/common/guards/rate-limit.guard';
import { RATE_LIMIT_METADATA_KEY } from '../../src/common/decorators/rate-limit.decorator';

describe('RateLimitGuard (Anti-Flooding & Bot Protection)', () => {
  let guard: RateLimitGuard;
  let reflector: Reflector;

  beforeEach(() => {
    RateLimitGuard.resetLogs();
    reflector = new Reflector();
    guard = new RateLimitGuard(reflector);
  });

  const createMockContext = (userId?: string, ip = '127.0.0.1'): ExecutionContext => {
    const handler = function testHandler() {};
    const controller = function TestController() {};

    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { sub: userId } : undefined,
          ip,
          headers: {},
        }),
        getResponse: () => ({
          setHeader: jest.fn(),
        }),
      }),
    } as any;
  };

  it('should allow requests if no @RateLimit metadata is configured', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('user-1');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow requests under the limit (e.g. 5 posts / hour)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      limit: 5,
      ttlSeconds: 3600,
      keyPrefix: 'create_post',
    });

    const context = createMockContext('user-author-1');

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('should throw 429 Too Many Requests when exceeding the limit', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      limit: 5,
      ttlSeconds: 3600,
      keyPrefix: 'create_post',
    });

    const context = createMockContext('user-author-2');

    // Make 5 successful requests
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    // 6th request should fail
    try {
      guard.canActivate(context);
      fail('Expected HttpException 429');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      const res = err.getResponse();
      expect(res.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.retryAfterSeconds).toBeGreaterThan(0);
      expect(res.message).toContain('Bạn đang thao tác quá nhanh');
    }
  });

  it('should isolate rate limits per user/IP', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      limit: 2,
      ttlSeconds: 60,
      keyPrefix: 'create_comment',
    });

    const user1Context = createMockContext('user-1');
    const user2Context = createMockContext('user-2');

    // user-1 exhausts quota
    expect(guard.canActivate(user1Context)).toBe(true);
    expect(guard.canActivate(user1Context)).toBe(true);
    expect(() => guard.canActivate(user1Context)).toThrow(HttpException);

    // user-2 should still be allowed
    expect(guard.canActivate(user2Context)).toBe(true);
    expect(guard.canActivate(user2Context)).toBe(true);
  });
});
