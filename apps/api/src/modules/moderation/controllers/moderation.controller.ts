import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from '../services/moderation.service';
import { ReportsService } from '../../reports/services/reports.service';
import { ExecuteModerationActionDto } from '../dto/execute-moderation-action.dto';
import { QueryReportsDto } from '../../reports/dto/query-reports.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';

@ApiTags('Moderation')
@ApiBearerAuth('JWT-auth')
@Controller('moderation')
@UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
    private readonly reportsService: ReportsService,
    private readonly jitService: JitProvisioningService,
  ) {}

  @Get('reports')
  @ApiOperation({ summary: 'Get paginated moderation reports queue (Requires moderation:manage permission)' })
  @ApiResponse({ status: 200, description: 'Paginated ReportEntity queue' })
  @ApiResponse({ status: 403, description: 'Permission moderation:manage required' })
  @RequirePermission('moderation:manage')
  getReports(@Query() query: QueryReportsDto) {
    return this.reportsService.getQueue(query.status, query.page, query.limit);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get paginated moderation posts queue (UNREVIEWED, APPROVED, BANNED, ALL)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts for moderation' })
  @ApiResponse({ status: 403, description: 'Permission moderation:manage required' })
  @RequirePermission('moderation:manage')
  getPostsQueue(
    @Query('status') status = 'UNREVIEWED',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.moderationService.getPostsQueue(status, Number(page), Number(limit));
  }

  @Patch('posts/:id/approve')
  @ApiOperation({ summary: 'Approve / mark post as reviewed by Admin' })
  @ApiResponse({ status: 200, description: 'Post approved' })
  @ApiResponse({ status: 403, description: 'Permission moderation:manage required' })
  @RequirePermission('moderation:manage')
  approvePost(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.moderationService.approvePost(user.sub, id);
  }

  @Patch('posts/:id/ban')
  @ApiOperation({ summary: 'Ban / hide post from public view (only visible to author and admin)' })
  @ApiResponse({ status: 200, description: 'Post banned and hidden' })
  @ApiResponse({ status: 403, description: 'Permission moderation:manage required' })
  @RequirePermission('moderation:manage')
  banPost(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.moderationService.banPost(user.sub, id, reason);
  }

  @Post('actions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute moderation action (WARN, HIDE_CONTENT, SUSPEND, BAN, DISMISS) with single-transaction audit logging' })
  @ApiResponse({ status: 200, description: 'Executed ModerationActionEntity' })
  @ApiResponse({ status: 400, description: 'Invalid target action (e.g. HIDE_CONTENT on User target)' })
  @ApiResponse({ status: 403, description: 'Permission moderation:manage required' })
  @RequirePermission('moderation:manage')
  executeAction(
    @CurrentUser() user: any,
    @Body() dto: ExecuteModerationActionDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.moderationService.executeAction(user.sub, roles, dto);
  }
}
