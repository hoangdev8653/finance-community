import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatusGuard } from '../../src/modules/auth/guards/account-status.guard';
import { JitProvisioningService } from '../../src/modules/users/services/jit-provisioning.service';

describe('AccountStatusGuard', () => {
  let guard: AccountStatusGuard;
  let reflector: Reflector;
  let jitService: JitProvisioningService;

  beforeEach(() => {
    reflector = new Reflector();
    jitService = new JitProvisioningService();
    guard = new AccountStatusGuard(reflector, jitService);
  });

  it('should pass for ACTIVE user account', async () => {
    const sub = 'user-active-123';
    await jitService.ensureUserProvisioned({ sub, email: 'active@example.com' });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub, app_status: 'ACTIVE' },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException (403) for SUSPENDED user account', async () => {
    const sub = 'user-suspended-123';
    await jitService.ensureUserProvisioned({ sub, email: 'suspended@example.com' });
    jitService.setUserStatus(sub, 'SUSPENDED');
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub, app_status: 'SUSPENDED' },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException (403) for BANNED user account', async () => {
    const sub = 'user-banned-123';
    await jitService.ensureUserProvisioned({ sub, email: 'banned@example.com' });
    jitService.setUserStatus(sub, 'BANNED');
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub, app_status: 'BANNED' },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });
});
