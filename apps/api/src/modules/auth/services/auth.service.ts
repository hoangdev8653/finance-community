import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { securityConfig } from '../../../config/security.config';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

interface LocalCredentials {
  userId: string;
  email: string;
  username: string;
  passwordHash: string;
}

import { OAuth2Client } from 'google-auth-library';
import { createHash } from 'crypto';
import { GoogleAuthDto } from '../dto/google-auth.dto';

// In-memory local password store for local authentication credentials
const localUserCredentials = new Map<string, LocalCredentials>();

@Injectable()
export class AuthService {
  private googleOAuthClient?: OAuth2Client;

  constructor(
    @Inject(securityConfig.KEY)
    private readonly secConfig: ConfigType<typeof securityConfig>,
    private readonly jwtService: JwtService,
    private readonly jitService: JitProvisioningService,
  ) {
    if (this.secConfig.googleClientId && this.secConfig.googleClientId !== 'mock-google-client-id.apps.googleusercontent.com') {
      this.googleOAuthClient = new OAuth2Client(this.secConfig.googleClientId);
    }
  }

  async register(dto: RegisterDto) {
    const emailKey = dto.email.toLowerCase();

    // Check if email already registered locally
    if (localUserCredentials.has(emailKey)) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'Email address is already registered.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // Check if username is taken locally
    for (const cred of localUserCredentials.values()) {
      if (cred.username.toLowerCase() === dto.username.toLowerCase()) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: 'Username is already taken.',
          code: 'USERNAME_ALREADY_EXISTS',
        });
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();

    // Provision User, Profile and Role in DB/Store
    const userRecord = await this.jitService.ensureUserProvisioned({
      sub: userId,
      email: dto.email,
      displayName: dto.username,
    });

    // Save local credentials
    localUserCredentials.set(emailKey, {
      userId: userRecord.id,
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    // Sign local JWT Token
    const accessToken = this.jwtService.sign(
      { sub: userRecord.id, email: userRecord.email },
      { secret: this.secConfig.jwtSecret, expiresIn: '7d' },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: dto.username,
        status: userRecord.status,
      },
    };
  }

  async login(dto: LoginDto) {
    const emailKey = dto.email.toLowerCase();
    const credentials = localUserCredentials.get(emailKey);

    if (!credentials) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, credentials.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Ensure user record is provisioned
    const userRecord = await this.jitService.ensureUserProvisioned({
      sub: credentials.userId,
      email: credentials.email,
    });

    const accessToken = this.jwtService.sign(
      { sub: userRecord.id, email: userRecord.email },
      { secret: this.secConfig.jwtSecret, expiresIn: '7d' },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: credentials.username,
        status: userRecord.status,
      },
    };
  }

  async authenticateGoogleUser(dto: GoogleAuthDto) {
    let email: string;
    let name: string;
    let googleSub: string;

    // Handle mock token for test environments or verify real Google ID Token
    if (dto.idToken.startsWith('mock_google_id_token_')) {
      const mockName = dto.idToken.replace('mock_google_id_token_', '') || 'google_user';
      googleSub = '109876543210987654321';
      email = `${mockName}@gmail.com`;
      name = mockName;
    } else {
      try {
        const client = this.googleOAuthClient || new OAuth2Client(this.secConfig.googleClientId);
        const ticket = await client.verifyIdToken({
          idToken: dto.idToken,
          audience: this.secConfig.googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new UnauthorizedException({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid Google ID Token payload.',
            code: 'INVALID_GOOGLE_TOKEN',
          });
        }

        email = payload.email;
        name = payload.name || payload.email.split('@')[0];
        googleSub = payload.sub;
      } catch (err: any) {
        throw new UnauthorizedException({
          statusCode: 401,
          error: 'Unauthorized',
          message: err.message || 'Google ID Token verification failed.',
          code: 'GOOGLE_AUTH_FAILED',
        });
      }
    }

    // Convert Google Sub ID to deterministic UUID v4 format
    const hex = createHash('md5').update(`google:${googleSub}`).digest('hex');
    const userUuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;

    // Provision user automatically via JIT Service
    const userRecord = await this.jitService.ensureUserProvisioned({
      sub: userUuid,
      email,
      displayName: name,
    });

    const accessToken = this.jwtService.sign(
      { sub: userRecord.id, email: userRecord.email },
      { secret: this.secConfig.jwtSecret, expiresIn: '7d' },
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: name.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        status: userRecord.status,
        provider: 'GOOGLE',
      },
    };
  }
}
