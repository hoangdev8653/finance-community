import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';

@Injectable()
export class AccountStatusGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      return true; // Let JwtAuthGuard handle unauthenticated state if applicable
    }

    // Query user record statefully from PostgreSQL/storage
    const userRecord = await this.jitService.getUserByIdAsync(user.sub);
    const status = userRecord?.status || user.app_status || 'ACTIVE';

    if (status !== 'ACTIVE') {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `Your account is currently ${status.toLowerCase()}. Access to authenticated platform features is restricted.`,
        code: `ACCOUNT_${status}`,
        accountStatus: status,
      });
    }

    return true;
  }
}
