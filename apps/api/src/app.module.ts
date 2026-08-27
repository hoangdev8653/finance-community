import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { securityConfig } from './config/security.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { databaseConfig } from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from './modules/auth/guards/account-status.guard';
import { EmailVerificationGuard } from './modules/auth/guards/email-verification.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestSecurityController } from './controllers/test-security.controller';

import { MediaModule } from './modules/media/media.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { PostsModule } from './modules/posts/posts.module';
import { SeriesModule } from './modules/series/series.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { FollowsModule } from './modules/follows/follows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AdminModule } from './modules/admin/admin.module';
import { DomainsModule } from './modules/domains/domains.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [securityConfig, rateLimitConfig, databaseConfig],
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 1000,
      },
    ]),
    AuthModule,
    UsersModule,
    AuditModule,
    MediaModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    ReactionsModule,
    FollowsModule,
    NotificationsModule,
    ReportsModule,
    SeriesModule,
    PostsModule,
    ModerationModule,
    AdminModule,
    DomainsModule,
  ],
  controllers: [AppController, TestSecurityController],
  providers: [
    AppService,
    // Strict Guard Pipeline Execution Order matching AUTH_SECURITY_SPEC.md Section 9.1:
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountStatusGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EmailVerificationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
