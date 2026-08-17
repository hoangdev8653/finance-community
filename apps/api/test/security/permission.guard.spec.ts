import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../../src/modules/auth/guards/permission.guard';
import { JitProvisioningService } from '../../src/modules/users/services/jit-provisioning.service';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let jitService: JitProvisioningService;

  beforeEach(() => {
    reflector = new Reflector();
    jitService = new JitProvisioningService();
    guard = new PermissionGuard(reflector, jitService);
  });

  it('should allow MEMBER user to execute posts:create permission', async () => {
    const sub = 'user-member-123';
    await jitService.ensureUserProvisioned({ sub, email: 'member@example.com' });
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'requirePermissions') return ['posts:create'];
      return false;
    });

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should block MEMBER user from executing posts:delete:any permission', async () => {
    const sub = 'user-member-456';
    await jitService.ensureUserProvisioned({ sub, email: 'member2@example.com' });
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'requirePermissions') return ['posts:delete:any'];
      return false;
    });

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
  });

  it('should allow MODERATOR user to execute posts:delete:any permission', async () => {
    const sub = 'user-mod-789';
    await jitService.ensureUserProvisioned({ sub, email: 'mod@example.com' });
    jitService.assignRoleToUser(sub, 'MODERATOR');

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'requirePermissions') return ['posts:delete:any'];
      return false;
    });

    const mockContext = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
