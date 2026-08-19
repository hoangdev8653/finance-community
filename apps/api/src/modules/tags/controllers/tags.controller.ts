import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { QueryTagsDto } from '../dto/query-tags.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search content tags' })
  @ApiResponse({ status: 200, description: 'Array of TagEntity objects' })
  searchTags(@Query() query: QueryTagsDto) {
    return this.tagsService.searchTags(query.search, query.limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get tag detail by ID' })
  @ApiResponse({ status: 200, description: 'TagEntity object' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  getTag(@Param('id') id: string) {
    return this.tagsService.getTagById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new content tag' })
  @ApiResponse({ status: 201, description: 'Created TagEntity' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer JWT' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  createTag(@Body() dto: CreateTagDto) {
    return this.tagsService.createTag(dto);
  }
}
