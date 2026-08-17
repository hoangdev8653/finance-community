import {
  Controller,
  Get,
  Post,
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
