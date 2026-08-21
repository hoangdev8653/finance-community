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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionsService } from '../services/reactions.service';
import { ToggleReactionDto } from '../dto/toggle-reaction.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';

@ApiTags('Reactions')
@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('posts/:id/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atomically toggle reaction (Like/Unlike) on a post' })
  @ApiResponse({ status: 200, description: 'Reaction toggle state payload' })
  @ApiResponse({ status: 404, description: 'Post not found or unpublished' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 30 reactions per minute)' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard, RateLimitGuard)
  @RateLimit({ limit: 30, ttlSeconds: 60, keyPrefix: 'reaction' })
  togglePostReaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ToggleReactionDto,
  ) {
    return this.reactionsService.togglePostReaction(user.sub, id, dto);
  }

  @Post('comments/:id/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atomically toggle reaction (Like/Unlike) on a comment' })
  @ApiResponse({ status: 200, description: 'Reaction toggle state payload' })
  @ApiResponse({ status: 400, description: 'Cannot react to a deleted comment' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 30 reactions per minute)' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard, RateLimitGuard)
  @RateLimit({ limit: 30, ttlSeconds: 60, keyPrefix: 'reaction' })
  toggleCommentReaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ToggleReactionDto,
  ) {
    return this.reactionsService.toggleCommentReaction(user.sub, id, dto);
  }

  @Get('posts/:id/reactions')
  @ApiOperation({ summary: 'Get total reactions count and current user reaction state for a post' })
  @ApiResponse({ status: 200, description: 'Reaction count summary payload' })
  getPostReactionCounts(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.reactionsService.getPostReactionCounts(id, user?.sub);
  }

  @Get('comments/:id/reactions')
  @ApiOperation({ summary: 'Get total reactions count and current user reaction state for a comment' })
  @ApiResponse({ status: 200, description: 'Reaction count summary payload' })
  getCommentReactionCounts(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.reactionsService.getCommentReactionCounts(id, user?.sub);
  }
}
