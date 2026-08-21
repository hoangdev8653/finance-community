import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_METADATA_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  // In-memory sliding log store: key -> list of timestamp ms
  private static readonly requestLogs = new Map<string, number[]>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @RateLimit decorator is present, allow through
    if (!options) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const identifier =
      req.user?.sub ||
      req.ip ||
      req.headers['x-forwarded-for'] ||
      'anonymous';

    const handlerName = context.getHandler().name;
    const key = `ratelimit:${options.keyPrefix || handlerName}:${identifier}`;

    const now = Date.now();
    const ttlMs = options.ttlSeconds * 1000;

    let timestamps = RateLimitGuard.requestLogs.get(key) || [];

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter((t) => now - t < ttlMs);

    if (timestamps.length >= options.limit) {
      const oldestInWindow = timestamps[0];
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldestInWindow + ttlMs - now) / 1000),
      );

      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Retry-After', retryAfterSeconds.toString());
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${retryAfterSeconds} giây.`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Record this request
    timestamps.push(now);
    RateLimitGuard.requestLogs.set(key, timestamps);

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-RateLimit-Limit', options.limit.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        (options.limit - timestamps.length).toString(),
      );
    }

    // Cleanup store if it grows large
    if (RateLimitGuard.requestLogs.size > 20000) {
      for (const [k, tsList] of RateLimitGuard.requestLogs.entries()) {
        const active = tsList.filter((t) => now - t < ttlMs);
        if (active.length === 0) {
          RateLimitGuard.requestLogs.delete(k);
        } else {
          RateLimitGuard.requestLogs.set(k, active);
        }
      }
    }

    return true;
  }

  // Utility method for testing / resetting rate limits
  public static resetLogs(): void {
    RateLimitGuard.requestLogs.clear();
  }
}
