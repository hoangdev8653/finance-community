import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread notifications count for current user' })
  @ApiResponse({ status: 200, description: 'Object with unread count' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notification feed' })
  @ApiResponse({ status: 200, description: 'Paginated list of NotificationEntity items' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer JWT' })
  getUserNotifications(
    @CurrentUser() user: any,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.notificationsService.getUserNotifications(
      user.sub,
      query.isRead,
      query.category,
      query.type,
      query.page,
      query.limit,
    );
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked read' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.sub);
  }
}
