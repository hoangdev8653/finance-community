import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { QuerySeriesDto } from '../dto/query-series.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { LearningSeriesService } from '../services/learning-series.service';
import { CreateLearningSeriesDto, AddSeriesLessonDto } from '../dto/create-learning-series.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService, private readonly learningSeriesService: LearningSeriesService) {}

  @Public() @Get('learning') getLearningSeries() { return this.learningSeriesService.list(); }

  @Get('learning/:id') getLearningSeriesDetail(@Param('id') id: string) { return this.learningSeriesService.get(id); }

  @Post('learning') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  createLearningSeries(@CurrentUser() user: any, @Body() dto: CreateLearningSeriesDto) { return this.learningSeriesService.create(user.sub, dto); }

  @Post('learning/:id/lessons') @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard) @RequirePermission('learning:manage')
  addLearningLesson(@Param('id') id: string, @Body() dto: AddSeriesLessonDto) { return this.learningSeriesService.addLesson(id, dto); }

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
