import { Injectable, Inject } from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { tagsTable } from '../schema/tags.schema';

export type TagEntity = typeof tagsTable.$inferSelect;
export type NewTagEntity = typeof tagsTable.$inferInsert;

@Injectable()
export class TagsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<TagEntity | undefined> {
    const [record] = await this.db.select().from(tagsTable).where(eq(tagsTable.id, id));
    return record;
  }

  async findBySlug(slug: string): Promise<TagEntity | undefined> {
    const [record] = await this.db.select().from(tagsTable).where(eq(tagsTable.slug, slug));
    return record;
  }

  async searchByName(search?: string, limit = 20): Promise<TagEntity[]> {
    if (search && search.trim().length > 0) {
      return this.db
        .select()
        .from(tagsTable)
        .where(ilike(tagsTable.name, `%${search.trim()}%`))
        .limit(limit);
    }
    return this.db.select().from(tagsTable).limit(limit);
  }

  async createOrGetTx(tx: any, name: string, slug: string): Promise<TagEntity> {
    const client = tx || this.db;
    const [created] = await client
      .insert(tagsTable)
      .values({ name, slug })
      .onConflictDoNothing({ target: tagsTable.slug })
      .returning();

    if (created) {
      return created;
    }

    const existing = await this.findBySlug(slug);
    return existing!;
  }
}
