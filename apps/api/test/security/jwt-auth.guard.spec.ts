import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../src/modules/auth/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should allow access to routes decorated with @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException when handleRequest is called with null user', () => {
    expect(() => guard.handleRequest(null, null, { message: 'Token missing' })).toThrow(
      UnauthorizedException,
    );
  });

  it('should return user when valid payload is passed to handleRequest', () => {
    const mockUser = { sub: 'user-uuid-123', email: 'test@example.com' };
    const result = guard.handleRequest(null, mockUser, null);
    expect(result).toEqual(mockUser);
  });
});
