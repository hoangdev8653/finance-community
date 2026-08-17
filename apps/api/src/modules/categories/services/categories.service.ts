import { Injectable, NotFoundException, ConflictException, Optional } from '@nestjs/common';
import { CategoriesRepository, CategoryEntity } from '../../../database/repositories/categories.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { AuditLogService } from '../../audit/services/audit-log.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    @Optional() private readonly auditLogService?: AuditLogService,
  ) {}

  async getCategories(scope?: string): Promise<CategoryEntity[]> {
    return this.categoriesRepo.findAllByScope(scope);
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Category with ID '${id}' not found.`,
        code: 'CATEGORY_NOT_FOUND',
      });
    }
    return category;
  }

  async createCategory(adminId: string, dto: CreateCategoryDto, tx?: any): Promise<CategoryEntity> {
    const existing = await this.categoriesRepo.findByScopeAndSlug(dto.scope, dto.slug);
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Category with slug '${dto.slug}' already exists in scope '${dto.scope}'.`,
        code: 'CATEGORY_SLUG_EXISTS',
      });
    }

    const record = await this.categoriesRepo.createTx(tx, {
      name: dto.name,
      slug: dto.slug,
      scope: dto.scope,
      description: dto.description || null,
      sortOrder: dto.sortOrder ?? 0,
    });

    if (this.auditLogService) {
      await this.auditLogService.log({
        actor_id: adminId,
        action: 'CATEGORY_CREATE',
        entity_type: 'categories',
        entity_id: record.id,
        metadata: { name: record.name, scope: record.scope, slug: record.slug },
      });
    }

    return record;
  }

  async updateCategory(adminId: string, id: string, dto: UpdateCategoryDto, tx?: any): Promise<CategoryEntity> {
    const category = await this.getCategoryById(id);

    const updated = await this.categoriesRepo.updateTx(tx, id, {
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder,
    });

    if (!updated) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Category with ID '${id}' not found for update.`,
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    if (this.auditLogService) {
      await this.auditLogService.log({
        actor_id: adminId,
        action: 'CATEGORY_UPDATE',
        entity_type: 'categories',
        entity_id: updated.id,
        metadata: { previousName: category.name, newName: updated.name },
      });
    }

    return updated;
  }
}
