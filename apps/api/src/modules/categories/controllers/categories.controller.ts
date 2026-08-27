import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoriesDto } from '../dto/query-categories.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of content categories' })
  @ApiResponse({ status: 200, description: 'Array of CategoryEntity objects' })
  getCategories(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.getCategories(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category detail by ID' })
  @ApiResponse({ status: 200, description: 'CategoryEntity object' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategory(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new content category (Requires categories:manage permission)' })
  @ApiResponse({ status: 201, description: 'Created CategoryEntity' })
  @ApiResponse({ status: 403, description: 'Permission categories:manage required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  createCategory(
    @CurrentUser() user: any,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(user.sub, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing category (Requires categories:manage permission)' })
  @ApiResponse({ status: 200, description: 'Updated CategoryEntity' })
  @ApiResponse({ status: 403, description: 'Permission categories:manage required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  updateCategory(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Requires categories:manage permission)' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  deleteCategory(@CurrentUser() user: any, @Param('id') id: string) {
    return this.categoriesService.deleteCategory(user.sub, id);
  }
}
