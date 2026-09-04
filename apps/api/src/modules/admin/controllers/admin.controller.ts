import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UpdateSystemSettingDto } from '../dto/update-system-setting.dto';
import { ToggleFeatureFlagDto } from '../dto/toggle-feature-flag.dto';
import { QueryAuditLogsDto } from '../dto/query-audit-logs.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';
import { QueryAdminUsersDto } from '../dto/query-admin-users.dto';
import { QueryAdminCommentsDto } from '../dto/query-admin-comments.dto';
import { UpdateCommentStatusDto } from '../dto/update-comment-status.dto';

import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Admin')
@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jitService: JitProvisioningService,
  ) {}

  @Get('admin/overview')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get live admin dashboard overview metrics' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('admin/analytics/popular-posts')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getPopularPosts(@Query('limit') limit?: string) {
    return this.adminService.getPopularPosts(Math.min(Number(limit) || 5, 20));
  }

  @Get('admin/analytics/posts-by-category')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getPostCategoryStats() {
    return this.adminService.getPostCategoryStats();
  }

  @Get('admin/users')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List users for admin governance' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getUsers(@Query() query: QueryAdminUsersDto) {
    return this.adminService.getUsers(query.page, query.limit, query.search, query.status);
  }

  // PUBLIC ENDPOINT: Feature Flag Map for UI client rendering
  @Public()
  @Get('feature-flags')
  @ApiTags('Feature Flags')
  @ApiOperation({ summary: 'Get active public feature flags map for UI client rendering' })
  @ApiResponse({ status: 200, description: 'Key-boolean feature flag map object' })
  getPublicFeatureFlags() {
    return this.adminService.getPublicFeatureFlags();
  }

  @Patch('admin/users/:id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user account status (ACTIVE, SUSPENDED, BANNED, DEACTIVATED) (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Updated UserEntity status' })
  @ApiResponse({ status: 400, description: 'Cannot modify self status' })
  @ApiResponse({ status: 403, description: 'Permission admin:full required or privilege escalation denied' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  changeUserStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.changeUserStatus(user.sub, roles, id, dto);
  }

  @Post('admin/roles/assign')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign RBAC role to target user (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 403, description: 'Cannot modify self role or assign SUPER_ADMIN without SUPER_ADMIN role' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  assignRole(@CurrentUser() user: any, @Body() dto: AssignRoleDto) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.assignRole(user.sub, roles, dto);
  }

  @Post('admin/roles/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke RBAC role from target user (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  @ApiResponse({ status: 403, description: 'Cannot modify self role or revoke SUPER_ADMIN without SUPER_ADMIN role' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  revokeRole(@CurrentUser() user: any, @Body() dto: AssignRoleDto) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.revokeRole(user.sub, roles, dto);
  }

  @Get('admin/settings')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('System Settings')
  @ApiOperation({ summary: 'Get all system configuration key-value settings (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Array of SystemSettingEntity items' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Patch('admin/settings/:key')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('System Settings')
  @ApiOperation({ summary: 'Upsert system configuration key-value setting (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Updated SystemSettingEntity' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  updateSystemSetting(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.updateSystemSetting(user.sub, roles, key, dto);
  }

  @Get('admin/feature-flags')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Feature Flags')
  @ApiOperation({ summary: 'Get full list of feature flag entities with descriptions (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Array of FeatureFlagEntity items' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getAdminFeatureFlags() {
    return this.adminService.getAdminFeatureFlags();
  }

  @Patch('admin/feature-flags/:key')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Feature Flags')
  @ApiOperation({ summary: 'Toggle feature flag state (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Updated FeatureFlagEntity' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  toggleFeatureFlag(
    @CurrentUser() user: any,
    @Param('key') key: string,
    @Body() dto: ToggleFeatureFlagDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.toggleFeatureFlag(user.sub, roles, key, dto);
  }

  @Get('admin/audit-logs')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Audit Logs')
  @ApiOperation({ summary: 'Query global security and governance audit logs (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Paginated AuditLogEntity list' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getAuditLogs(@Query() query: QueryAuditLogsDto) {
    return this.adminService.getAuditLogs(
      query.page,
      query.limit,
      query.actorId,
      query.entityType,
      query.action,
    );
  }

  @Get('admin/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Comments')
  @ApiOperation({ summary: 'Query all comments across platform for admin moderation (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Paginated comments list' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  getComments(@Query() query: QueryAdminCommentsDto) {
    return this.adminService.getComments(query.page, query.limit, query.status, query.search);
  }

  @Patch('admin/comments/:id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Comments')
  @ApiOperation({ summary: 'Update comment visibility status (VISIBLE / HIDDEN) (Requires admin:full)' })
  @ApiResponse({ status: 200, description: 'Updated comment entity' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('admin:full')
  updateCommentStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCommentStatusDto,
  ) {
    const roles = this.jitService.getUserRoles(user.sub);
    return this.adminService.updateCommentStatus(user.sub, roles, id, dto);
  }
}
