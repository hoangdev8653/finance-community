import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSION_MATRIX, RoleName } from '../../../config/permission-matrix.config';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jitService: JitProvisioningService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Insufficient permissions: user unauthenticated.',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    // Resolve user application roles exclusively from public.user_roles / public.roles
    // Supabase JWT role claim ('authenticated') is strictly ignored!
    const userRoles = await this.jitService.getUserRolesAsync(user.sub);

    // Default to MEMBER if no role explicit (fallback for JIT)
    const effectiveRoles = userRoles.length > 0 ? userRoles : ['MEMBER'];

    // Resolve all granted permissions for user's assigned roles
    const grantedPermissions = new Set<string>();
    for (const role of effectiveRoles) {
      const rolePermissions = PERMISSION_MATRIX[role as RoleName] || [];
      rolePermissions.forEach((p) => grantedPermissions.add(p));
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      grantedPermissions.has(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `You do not have the required permission (${requiredPermissions.join(', ')}) to perform this action.`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions,
      });
    }

    return true;
  }
}
