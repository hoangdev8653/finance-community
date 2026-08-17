import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_EMAIL_VERIFICATION_KEY } from '../decorators/require-email-verification.decorator';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresVerification = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_EMAIL_VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresVerification) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let JwtAuthGuard handle unauthenticated requests
    }

    const emailConfirmedAt = user.email_confirmed_at;
    const isEmailVerified: boolean =
      emailConfirmedAt !== null &&
      emailConfirmedAt !== undefined &&
      emailConfirmedAt !== '';

    if (!isEmailVerified) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Email verification required to perform community actions.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    return true;
  }
}
