import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiEditorialService } from './ai-editorial.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../auth/guards/account-status.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('AI Editorial')
@Controller('ai-editorial')
export class AiEditorialController {
  constructor(private readonly service: AiEditorialService) {}
  @Post('draft')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  createDraft(
    @Body() body: { title: string; domain: string; category: string; series?: string; lessonOrder?: number; sources?: string },
  ) {
    return this.service.createDraft(body);
  }
}
