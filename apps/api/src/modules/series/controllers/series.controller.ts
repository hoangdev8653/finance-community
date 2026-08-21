import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { QuerySeriesDto } from '../dto/query-series.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

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
