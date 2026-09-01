import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LearningService } from '../services/learning.service';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { UpsertQuizDto } from '../dto/upsert-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { UpdateEditorialStatusDto } from '../dto/update-editorial-status.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { QueryLearningPostsDto } from '../dto/query-learning-posts.dto';
import { CreateLearningSourceDto } from '../dto/create-learning-source.dto';

@ApiTags('Learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user learning progress' })
  getUserProgress(@CurrentUser() user: any) {
    return this.learningService.getUserProgress(user.sub);
  }

  @Get('posts/:postId/quiz')
  @Public()
  @ApiOperation({ summary: 'Get the quiz attached to a published learning post' })
  getQuiz(@Param('postId') postId: string) {
    return this.learningService.getQuizForPost(postId);
  }

  @Get('admin/posts/:postId/quiz')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Get a quiz with correct answers for editorial editing' })
  getAdminQuiz(@Param('postId') postId: string) { return this.learningService.getAdminQuizForPost(postId); }

  @Get('posts/:postId/detail')
  @Public()
  @ApiOperation({ summary: 'Get a complete learning post payload for the reader' })
  getLearningDetail(@Param('postId') postId: string, @CurrentUser() user?: any) { return this.learningService.getLearningDetail(postId, user?.sub); }

  @Get('posts/:postId/sources')
  @Public()
  @ApiOperation({ summary: 'List public sources for a learning post' })
  getSources(@Param('postId') postId: string) { return this.learningService.getSources(postId); }

  @Post('posts/:postId/quiz/submit')
  @Public()
  @ApiOperation({ summary: 'Grade a quiz submission without exposing correct answers' })
  submitQuiz(@CurrentUser() user: any, @Param('postId') postId: string, @Body() dto: SubmitQuizDto) { return this.learningService.submitQuiz(postId, dto, user?.sub); }

  @Patch('admin/posts/:postId/quiz')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Create or replace a quiz for a learning post' })
  upsertQuiz(@Param('postId') postId: string, @Body() dto: UpsertQuizDto) { return this.learningService.upsertQuiz(postId, dto); }

  @Patch('admin/posts/:postId/editorial-status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Move a learning post through the editorial workflow' })
  updateEditorialStatus(@CurrentUser() user: any, @Param('postId') postId: string, @Body() dto: UpdateEditorialStatusDto) { return this.learningService.updateEditorialStatus(postId, dto, user.sub); }

  @Patch('posts/:postId/submit-review')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiOperation({ summary: 'Submit an owned learning post for editorial review' })
  submitForReview(@CurrentUser() user: any, @Param('postId') postId: string) { return this.learningService.submitForReview(user.sub, postId); }

  @Get('admin/posts/:postId/audit-history')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Get Learning editorial status history for a post' })
  getAuditHistory(@Param('postId') postId: string) { return this.learningService.getAuditHistory(postId); }

  @Get('admin/posts')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'List learning posts for editorial review' })
  getEditorialQueue(@Query() query: QueryLearningPostsDto) { return this.learningService.getEditorialQueue(query); }

  @Post('admin/posts/:postId/sources')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Add a reference source to a learning post' })
  addSource(@Param('postId') postId: string, @Body() dto: CreateLearningSourceDto) { return this.learningService.addSource(postId, dto); }

  @Delete('admin/sources/:sourceId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('learning:manage')
  @ApiOperation({ summary: 'Delete a learning source reference' })
  removeSource(@Param('sourceId') sourceId: string) { return this.learningService.removeSource(sourceId); }

  @Get('posts/:postId/progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user progress for a learning post' })
  getProgress(@CurrentUser() user: any, @Param('postId') postId: string) {
    return this.learningService.getProgress(user.sub, postId);
  }

  @Patch('posts/:postId/progress')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update the current user progress for a learning post' })
  updateProgress(@CurrentUser() user: any, @Param('postId') postId: string, @Body() dto: UpdateProgressDto) {
    return this.learningService.updateProgress(user.sub, postId, dto);
  }
}
