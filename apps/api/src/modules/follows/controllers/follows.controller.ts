import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { FollowsService } from '../services/follows.service';
import { QueryFollowsDto } from '../dto/query-follows.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Follows')
@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Follow a user idempotently (201 Created on first follow, 200 OK on duplicate)' })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  @ApiResponse({ status: 200, description: 'Already following (Idempotent success)' })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself (CANNOT_FOLLOW_SELF)' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)
  async followUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const result = await this.followsService.followUser(user.sub, id);
    const statusCode = result.isNew ? HttpStatus.CREATED : HttpStatus.OK;
    return res.status(statusCode).json({
      following: result.following,
      followingId: result.followingId,
    });
  }

  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unfollow a user idempotently' })
  @ApiResponse({ status: 200, description: 'Unfollowed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot unfollow yourself' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  unfollowUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.followsService.unfollowUser(user.sub, id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get paginated list of user followers' })
  @ApiResponse({ status: 200, description: 'Paginated followers list with profile objects' })
  getFollowers(@Param('id') id: string, @Query() query: QueryFollowsDto) {
    return this.followsService.getFollowers(id, query.page, query.limit);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get paginated list of users followed by target user' })
  @ApiResponse({ status: 200, description: 'Paginated following list with profile objects' })
  getFollowing(@Param('id') id: string, @Query() query: QueryFollowsDto) {
    return this.followsService.getFollowing(id, query.page, query.limit);
  }
}
