import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  createDraft(@Body() body: { title: string; domain: string; category: string; series?: string; lessonOrder?: number }) {
    return this.service.createDraft(body);
  }
}
