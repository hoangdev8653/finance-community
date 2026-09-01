import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { QuerySeriesDto } from '../dto/query-series.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { LearningSeriesService } from '../services/learning-series.service';
import { CreateLearningSeriesDto, AddSeriesLessonDto, UpdateLearningSeriesDto, UpdateSeriesLessonDto, UpdateSeriesLessonOrderDto } from '../dto/create-learning-series.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService, private readonly learningSeriesService: LearningSeriesService) {}

  @Public() @Get('learning/paths') getPublishedLearningPaths() { return this.learningSeriesService.listPublished(); }

  @Get('learning') getLearningSeries() { return this.learningSeriesService.list(); }

  @Public() @Get('learning/paths/:slug') getLearningPath(@Param('slug') slug: string) { return this.learningSeriesService.getPublicPath(slug); }

  @Get('learning/:id/progress') @UseGuards(JwtAuthGuard, AccountStatusGuard)
  getLearningPathProgress(@CurrentUser() user: any, @Param('id') id: string) { return this.learningSeriesService.getPathProgress(id, user.sub); }

  @Get('learning/:id') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  getLearningSeriesDetail(@Param('id') id: string) { return this.learningSeriesService.get(id); }

  @Post('learning') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  createLearningSeries(@CurrentUser() user: any, @Body() dto: CreateLearningSeriesDto) { return this.learningSeriesService.create(user.sub, dto); }

  @Post('learning/:id/lessons') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  addLearningLesson(@Param('id') id: string, @Body() dto: AddSeriesLessonDto) { return this.learningSeriesService.addLesson(id, dto); }

  @Patch('learning/:id') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  updateLearningSeries(@Param('id') id: string, @Body() dto: UpdateLearningSeriesDto) { return this.learningSeriesService.update(id, dto); }

  @Patch('learning/:id/lessons/:postId/order') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  reorderLearningLesson(@Param('id') id: string, @Param('postId') postId: string, @Body() dto: UpdateSeriesLessonOrderDto) { return this.learningSeriesService.reorderLesson(id, postId, dto); }

  @Patch('learning/:id/lessons/:postId') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  updateLearningLesson(@Param('id') id: string, @Param('postId') postId: string, @Body() dto: UpdateSeriesLessonDto) { return this.learningSeriesService.updateLesson(id, postId, dto); }

  @Delete('learning/:id/lessons/:postId') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  deleteLearningLesson(@Param('id') id: string, @Param('postId') postId: string) { return this.learningSeriesService.removeLesson(id, postId); }

  @Delete('learning/:id') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  deleteLearningSeries(@Param('id') id: string) { return this.learningSeriesService.remove(id); }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of published article series' })
  @ApiResponse({ status: 200, description: 'Paginated list of SeriesEntity objects' })
  getAllSeries(@Query() query: QuerySeriesDto) {
    return this.seriesService.getAllSeriesCategories(query.page, query.limit);
  }

  @Public()
  @Get('posts/:id/navigation')
  @ApiOperation({ summary: 'Get series navigation (previous, next, and table of contents) for a post' })
  @ApiResponse({ status: 200, description: 'Series navigation details' })
  @ApiResponse({ status: 404, description: 'Series post not found' })
  getSeriesNavigation(@Param('id') id: string) {
    return this.seriesService.getSeriesNavigation(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get series detail and post list by slug' })
  @ApiResponse({ status: 200, description: 'Series detail object with paginated posts' })
  @ApiResponse({ status: 404, description: 'Series not found' })
  getSeriesBySlug(@Param('slug') slug: string, @Query() query: QuerySeriesDto) {
    return this.seriesService.getSeriesDetailBySlug(slug, query.page, query.limit);
  }
}
