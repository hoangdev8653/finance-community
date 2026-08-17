import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

import { Public } from '../modules/auth/decorators/public.decorator';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../modules/auth/decorators/current-user.decorator';
import { RequireEmailVerification } from '../modules/auth/decorators/require-email-verification.decorator';
import { RequirePermission } from '../modules/auth/decorators/require-permission.decorator';
import { AuditLogService } from '../modules/audit/services/audit-log.service';
import { JitProvisioningService } from '../modules/users/services/jit-provisioning.service';
import { SanitizerUtil } from '../common/utils/sanitizer.util';

export class CreatePostTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}

export class SuspendUserTestDto {
  @IsString()
  @IsNotEmpty()
  targetUserId!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

@Controller('test')
export class TestSecurityController {
  constructor(
    private readonly auditService: AuditLogService,
    private readonly jitService: JitProvisioningService,
  ) {}

  @Public()
  @Get('public')
  getPublic() {
    return {
      status: 'success',
      message: 'Public endpoint accessible without authentication.',
    };
  }

  @Get('authenticated')
  getAuthenticated(@CurrentUser() user: JwtPayload) {
    return {
      status: 'success',
      message: 'Authenticated endpoint accessed successfully.',
      user: {
        sub: user.sub,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        app_user_id: user.app_user_id,
        app_status: user.app_status,
      },
    };
  }

  @RequireEmailVerification()
  @RequirePermission('posts:create')
  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  createPost(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostTestDto) {
    const sanitizedBody = SanitizerUtil.sanitizeRichText(dto.body);
    const sanitizedTitle = SanitizerUtil.stripAllTags(dto.title);

    return {
      status: 'success',
      message: 'Community post created successfully by verified user.',
      post: {
        id: 'post-test-uuid',
        authorId: user.sub,
        title: sanitizedTitle,
        body: sanitizedBody,
      },
    };
  }

  @RequirePermission('posts:delete:any')
  @Post('posts/:id/delete-any')
  @HttpCode(HttpStatus.OK)
  async deleteAnyPost(@CurrentUser() user: JwtPayload, @Param('id') postId: string) {
    await this.auditService.log({
      actor_id: user.sub,
      action: 'POST_DELETE_OVERRIDE',
      entity_type: 'posts',
      entity_id: postId,
      metadata: { deleted_by: user.sub, role: 'MODERATOR' },
      reason: 'Moderation override deletion',
    });

    return {
      status: 'success',
      message: `Post ${postId} deleted by moderator/admin. Audit log recorded.`,
    };
  }

  @RequirePermission('users:suspend')
  @Post('users/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendUser(@CurrentUser() user: JwtPayload, @Body() dto: SuspendUserTestDto) {
    this.jitService.setUserStatus(dto.targetUserId, 'SUSPENDED');

    await this.auditService.log({
      actor_id: user.sub,
      action: 'USER_SUSPEND',
      entity_type: 'users',
      entity_id: dto.targetUserId,
      metadata: { previous_status: 'ACTIVE', new_status: 'SUSPENDED' },
      reason: dto.reason || 'Administrative suspension',
    });

    return {
      status: 'success',
      message: `User ${dto.targetUserId} status set to SUSPENDED.`,
    };
  }

  @Post('validation')
  testValidation(@Body() dto: CreatePostTestDto) {
    return {
      status: 'success',
      data: dto,
    };
  }
}
