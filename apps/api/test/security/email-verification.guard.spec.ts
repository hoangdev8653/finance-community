import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmailVerificationGuard } from '../../src/modules/auth/guards/email-verification.guard';

describe('EmailVerificationGuard', () => {
  let guard: EmailVerificationGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new EmailVerificationGuard(reflector);
  });

  it('should pass when route does not require email verification', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should pass when user has valid email_confirmed_at timestamp', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: 'user-123',
            email_confirmed_at: '2026-08-13T10:00:00Z',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException (403 EMAIL_NOT_VERIFIED) when email_confirmed_at is null', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: 'user-123',
            email_confirmed_at: null,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
