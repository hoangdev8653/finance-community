import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { JitProvisioningService } from '../../users/services/jit-provisioning.service';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jitService: JitProvisioningService,
  ) {}

  @Public()
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get thread comments for a post with soft-delete body masking' })
  @ApiResponse({ status: 200, description: 'Paginated list of SerializedComment objects' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  getPostComments(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
  ) {
    return this.commentsService.getPostComments(postId, query.page, query.limit);
  }

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new comment or nested reply under a post' })
  @ApiResponse({ status: 201, description: 'Created SerializedComment' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid parentId post mismatch' })
  @ApiResponse({ status: 403, description: 'Email verification required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded (Max 10 comments per 5 minutes)' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard, RateLimitGuard)
  @RateLimit({ limit: 10, ttlSeconds: 300, keyPrefix: 'create_comment' })
  createComment(
    @CurrentUser() user: any,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.sub, postId, dto);
  }

  @Patch('comments/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing comment text' })
  @ApiResponse({ status: 200, description: 'Updated SerializedComment' })
  @ApiResponse({ status: 400, description: 'Deleted comments cannot be edited' })
  @ApiResponse({ status: 403, description: 'Author permission required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  updateComment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(user.sub, id, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete comment' })
  @ApiResponse({ status: 204, description: 'Comment soft-deleted successfully' })
  @ApiResponse({ status: 403, description: 'Author or Moderator permission required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async deleteComment(@CurrentUser() user: any, @Param('id') id: string) {
    const roles = this.jitService.getUserRoles(user.sub);
    await this.commentsService.deleteComment(user.sub, roles, id);
  }
}
