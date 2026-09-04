import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { securityConfig } from '../../config/security.config';
import { SupabaseJwksStrategy } from './strategies/supabase-jwks.strategy';
import { LocalJwtStrategy } from './strategies/local-jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccountStatusGuard } from './guards/account-status.guard';
import { EmailVerificationGuard } from './guards/email-verification.guard';
import { PermissionGuard } from './guards/permission.guard';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthCredentialsRepository } from '../../database/repositories/auth-credentials.repository';
import { RefreshTokensRepository } from '../../database/repositories/refresh-tokens.repository';

@Module({
  imports: [
    ConfigModule.forFeature(securityConfig),
    PassportModule.register({ defaultStrategy: 'local-jwt' }),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCredentialsRepository,
    RefreshTokensRepository,
    LocalJwtStrategy,
    SupabaseJwksStrategy,
    JwtAuthGuard,
    AccountStatusGuard,
    EmailVerificationGuard,
    PermissionGuard,
    UsersModule,
  ],
  exports: [
    AuthService,
    RefreshTokensRepository,
    PassportModule,
    JwtModule,
    LocalJwtStrategy,
    SupabaseJwksStrategy,
    JwtAuthGuard,
    AccountStatusGuard,
    EmailVerificationGuard,
    PermissionGuard,
    UsersModule,
  ],
})
export class AuthModule {}
