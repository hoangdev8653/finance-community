import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DomainsRepository, type DomainWithCounts } from '../../database/repositories/domains.repository';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { QueryDomainsDto } from './dto/query-domains.dto';
import type { DomainEntity } from '../../database/schema/domains.schema';
import { SlugifyUtil } from '../../common/utils/slugify.util';

@Injectable()
export class DomainsService {
  constructor(private readonly domainsRepository: DomainsRepository) {}

  async getDomains(query: QueryDomainsDto = {}): Promise<DomainWithCounts[]> {
    const domains = await this.domainsRepository.findAll(query);
    const enriched = await Promise.all(
      domains.map(async (domain) => {
        const counts = await this.domainsRepository.countRelations(domain.id);
        return {
          ...domain,
          categoryCount: counts.categories,
          courseCount: counts.courses,
        };
      }),
    );
    return enriched;
  }

  async getDomainById(id: string): Promise<DomainWithCounts> {
    const domain = await this.domainsRepository.findById(id);
    if (!domain) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Lĩnh vực với ID '${id}' không tồn tại.`,
        code: 'DOMAIN_NOT_FOUND',
      });
    }
    const counts = await this.domainsRepository.countRelations(domain.id);
    return {
      ...domain,
      categoryCount: counts.categories,
      courseCount: counts.courses,
    };
  }

  async createDomain(dto: CreateDomainDto): Promise<DomainEntity> {
    const existingCode = await this.domainsRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Mã lĩnh vực '${dto.code}' đã tồn tại trong hệ thống.`,
        code: 'DOMAIN_CODE_EXISTS',
      });
    }

    let finalSlug: string;
    if (dto.slug && dto.slug.trim()) {
      finalSlug = dto.slug.trim().toLowerCase();
      const existingSlug = await this.domainsRepository.findBySlug(finalSlug);
      if (existingSlug) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Đường dẫn (slug) '${dto.slug}' đã tồn tại trong hệ thống.`,
          code: 'DOMAIN_SLUG_EXISTS',
        });
      }
    } else {
      const baseSlug = SlugifyUtil.slugify(dto.name, 80);
      finalSlug = baseSlug === 'post' ? 'linh-vuc' : baseSlug;
      let counter = 1;
      while (await this.domainsRepository.findBySlug(finalSlug)) {
        finalSlug = `${baseSlug.slice(0, 75)}-${counter++}`;
      }
    }

    return this.domainsRepository.create({
      code: dto.code.trim().toUpperCase(),
      slug: finalSlug,
      name: dto.name.trim(),
      nameVi: dto.nameVi?.trim() || null,
      nameEn: dto.nameEn?.trim() || null,
      description: dto.description?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      isPromoted: dto.isPromoted ?? false,
    });
  }

  async updateDomain(id: string, dto: UpdateDomainDto): Promise<DomainEntity> {
    const existing = await this.domainsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Lĩnh vực với ID '${id}' không tồn tại.`,
        code: 'DOMAIN_NOT_FOUND',
      });
    }

    if (dto.code && dto.code.trim().toUpperCase() !== existing.code) {
      const codeTaken = await this.domainsRepository.findByCode(dto.code.trim().toUpperCase());
      if (codeTaken) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Mã lĩnh vực '${dto.code}' đã được sử dụng.`,
          code: 'DOMAIN_CODE_EXISTS',
        });
      }
    }

    if (dto.slug && dto.slug.trim().toLowerCase() !== existing.slug) {
      const slugTaken = await this.domainsRepository.findBySlug(dto.slug.trim().toLowerCase());
      if (slugTaken) {
        throw new ConflictException({
          statusCode: 409,
          error: 'Conflict',
          message: `Đường dẫn (slug) '${dto.slug}' đã được sử dụng.`,
          code: 'DOMAIN_SLUG_EXISTS',
        });
      }
    }

    const updated = await this.domainsRepository.update(id, {
      ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
      ...(dto.slug ? { slug: dto.slug.trim().toLowerCase() } : {}),
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.nameVi !== undefined ? { nameVi: dto.nameVi?.trim() || null } : {}),
      ...(dto.nameEn !== undefined ? { nameEn: dto.nameEn?.trim() || null } : {}),
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
      ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.isPromoted !== undefined ? { isPromoted: dto.isPromoted } : {}),
    });

    if (!updated) {
      throw new NotFoundException(`Lĩnh vực với ID '${id}' không tìm thấy để cập nhật.`);
    }

    return updated;
  }

  async deleteDomain(id: string): Promise<DomainEntity> {
    const existing = await this.domainsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Lĩnh vực với ID '${id}' không tồn tại.`,
        code: 'DOMAIN_NOT_FOUND',
      });
    }

    const counts = await this.domainsRepository.countRelations(id);
    if (counts.categories > 0 || counts.courses > 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `Không thể xóa lĩnh vực “${existing.name}” vì đang có ${counts.categories} danh mục và ${counts.courses} khóa học trực thuộc. Vui lòng chuyển hoặc xóa các danh mục/khóa học trước.`,
        code: 'DOMAIN_HAS_CHILDREN',
      });
    }

    const deleted = await this.domainsRepository.delete(id);
    return deleted!;
  }
}
