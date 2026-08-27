import { Injectable, NotFoundException, ConflictException, Optional, BadRequestException } from '@nestjs/common';
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

  async getCategories(filtersOrScope: { scope?: string; domainId?: string; contentType?: string; parentId?: string; isActive?: boolean } | string = {}): Promise<CategoryEntity[]> {
    const filters = typeof filtersOrScope === 'string' ? { scope: filtersOrScope } : filtersOrScope;
    return this.categoriesRepo.findAll(filters);
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

  private throwInvalidCategoryDomain(message: string, code: string): never {
    throw new BadRequestException({
      statusCode: 400,
      error: 'Bad Request',
      message,
      code,
    });
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

    let effectiveDomainId = dto.domainId || null;
    if (dto.parentId) {
      const parent = await this.getCategoryById(dto.parentId);
      if (!parent.domainId) {
        this.throwInvalidCategoryDomain('Parent category must belong to a domain.', 'INVALID_PARENT_CATEGORY_DOMAIN');
      }
      if (effectiveDomainId && parent.domainId !== effectiveDomainId) {
        this.throwInvalidCategoryDomain(
          'Child category domain must match parent category domain.',
          'INVALID_PARENT_CATEGORY_DOMAIN',
        );
      }
      effectiveDomainId = effectiveDomainId || parent.domainId;
    }

    if (!effectiveDomainId) {
      this.throwInvalidCategoryDomain('Category must belong to a domain.', 'CATEGORY_DOMAIN_REQUIRED');
    }

    const record = await this.categoriesRepo.createTx(tx, {
      name: dto.name,
      slug: dto.slug,
      scope: dto.scope,
      domainId: effectiveDomainId,
      parentId: dto.parentId || null,
      nameVi: dto.nameVi || null,
      nameEn: dto.nameEn || null,
      contentTypes: dto.contentTypes?.length ? dto.contentTypes : [dto.scope],
      description: dto.description || null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      isPromoted: dto.isPromoted ?? false,
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

    const effectiveDomainId = dto.domainId !== undefined ? dto.domainId : category.domainId;
    const effectiveParentId = dto.parentId !== undefined ? dto.parentId : category.parentId;

    if (!effectiveDomainId) {
      this.throwInvalidCategoryDomain('Category must belong to a domain.', 'CATEGORY_DOMAIN_REQUIRED');
    }

    if (effectiveParentId) {
      if (effectiveParentId === id) {
        this.throwInvalidCategoryDomain('Category cannot be its own parent.', 'INVALID_PARENT_CATEGORY');
      }
      const parent = await this.getCategoryById(effectiveParentId);
      if (!parent.domainId || parent.domainId !== effectiveDomainId) {
        this.throwInvalidCategoryDomain(
          'Child category domain must match parent category domain.',
          'INVALID_PARENT_CATEGORY_DOMAIN',
        );
      }
    }

    const updated = await this.categoriesRepo.updateTx(tx, id, {
      name: dto.name,
      description: dto.description,
      domainId: effectiveDomainId,
      parentId: dto.parentId,
      nameVi: dto.nameVi,
      nameEn: dto.nameEn,
      contentTypes: dto.contentTypes,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      isPromoted: dto.isPromoted,
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

  async deleteCategory(adminId: string, id: string, tx?: any): Promise<{ id: string; deleted: true }> {
    const category = await this.getCategoryById(id);
    const deleted = await this.categoriesRepo.deleteTx(tx, id);
    if (!deleted) throw new NotFoundException(`Category with ID '${id}' not found.`);
    await this.auditLogService?.log({
      actor_id: adminId,
      action: 'CATEGORY_DELETE',
      entity_type: 'categories',
      entity_id: id,
      metadata: { name: category.name, slug: category.slug, scope: category.scope },
    });
    return { id, deleted: true };
  }
}
