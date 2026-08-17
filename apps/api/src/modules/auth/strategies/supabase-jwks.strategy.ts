import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import type { ConfigType } from '@nestjs/config';
import { securityConfig } from '../../../config/security.config';
import type { JwtPayload } from '../decorators/current-user.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SupabaseJwksStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(
    @Inject(securityConfig.KEY)
    private readonly secConfig: ConfigType<typeof securityConfig>,
    private readonly jitService: JitProvisioningService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: secConfig.audience,
      issuer: secConfig.issuer,
      algorithms: Array.from(secConfig.algorithms),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: secConfig.jwksUri,
      }),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (
      !payload ||
      !payload.sub ||
      typeof payload.sub !== 'string' ||
      !UUID_REGEX.test(payload.sub)
    ) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid JWT subject.',
        code: 'INVALID_SUBJECT',
      });
    }

    // Execute atomic JIT User Provisioning
    const userRecord = await this.jitService.ensureUserProvisioned({
      sub: payload.sub,
      email: payload.email,
    });

    return {
      ...payload,
      app_user_id: userRecord.id,
      app_status: userRecord.status,
    };
  }
}
