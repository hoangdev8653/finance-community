import { Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository, TagEntity, TagWithUsageCount } from '../../../database/repositories/tags.repository';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepo: TagsRepository) {}

  public slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }

  async searchTags(search?: string, limit = 20): Promise<TagWithUsageCount[]> {
    return this.tagsRepo.searchByName(search, limit);
  }

  async getTagById(id: string): Promise<TagWithUsageCount> {
    const tag = await this.tagsRepo.findById(id);
    if (!tag) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Tag with ID '${id}' not found.`,
        code: 'TAG_NOT_FOUND',
      });
    }
    return tag;
  }

  async createTag(dto: CreateTagDto, tx?: any): Promise<TagEntity> {
    const name = dto.name.trim();
    const slug = this.slugify(name);
    return this.tagsRepo.createOrGetTx(tx, name, slug);
  }

  async updateTag(id: string, dto: UpdateTagDto, tx?: any): Promise<TagEntity> {
    await this.getTagById(id);
    const name = dto.name.trim();
    const updated = await this.tagsRepo.updateTx(tx, id, name, this.slugify(name));
    if (!updated) throw new NotFoundException(`Tag with ID '${id}' not found.`);
    return updated;
  }

  async deleteTag(id: string, tx?: any): Promise<{ id: string; deleted: true }> {
    await this.getTagById(id);
    const deleted = await this.tagsRepo.deleteTx(tx, id);
    if (!deleted) throw new NotFoundException(`Tag with ID '${id}' not found.`);
    return { id, deleted: true };
  }
}
