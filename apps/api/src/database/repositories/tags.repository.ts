import { Injectable, Inject } from '@nestjs/common';
import { eq, ilike, count, desc, asc, or } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { tagsTable } from '../schema/tags.schema';
import { postTagsTable } from '../schema/post-tags.schema';

export type TagEntity = typeof tagsTable.$inferSelect;
export type NewTagEntity = typeof tagsTable.$inferInsert;

export interface TagWithUsageCount extends TagEntity {
  postCount: number;
}

@Injectable()
export class TagsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<TagWithUsageCount | undefined> {
    const [record] = await this.db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        slug: tagsTable.slug,
        createdAt: tagsTable.createdAt,
        postCount: count(postTagsTable.postId),
      })
      .from(tagsTable)
      .leftJoin(postTagsTable, eq(tagsTable.id, postTagsTable.tagId))
      .where(eq(tagsTable.id, id))
      .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug, tagsTable.createdAt);

    if (!record) return undefined;
    return { ...record, postCount: Number(record.postCount) };
  }

  async findBySlug(slug: string): Promise<TagWithUsageCount | undefined> {
    const [record] = await this.db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        slug: tagsTable.slug,
        createdAt: tagsTable.createdAt,
        postCount: count(postTagsTable.postId),
      })
      .from(tagsTable)
      .leftJoin(postTagsTable, eq(tagsTable.id, postTagsTable.tagId))
      .where(eq(tagsTable.slug, slug))
      .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug, tagsTable.createdAt);

    if (!record) return undefined;
    return { ...record, postCount: Number(record.postCount) };
  }

  async searchByName(search?: string, limit = 20): Promise<TagWithUsageCount[]> {
    const query = this.db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        slug: tagsTable.slug,
        createdAt: tagsTable.createdAt,
        postCount: count(postTagsTable.postId),
      })
      .from(tagsTable)
      .leftJoin(postTagsTable, eq(tagsTable.id, postTagsTable.tagId));

    const rows = search && search.trim().length > 0
      ? await query
          .where(or(ilike(tagsTable.name, `%${search.trim()}%`), ilike(tagsTable.slug, `%${search.trim().toLowerCase()}%`)))
          .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug, tagsTable.createdAt)
          .orderBy(desc(count(postTagsTable.postId)), asc(tagsTable.name))
          .limit(limit)
      : await query
          .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug, tagsTable.createdAt)
          .orderBy(desc(count(postTagsTable.postId)), asc(tagsTable.name))
          .limit(limit);

    return rows.map((r) => ({
      ...r,
      postCount: Number(r.postCount),
    }));
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

  async updateTx(tx: any, id: string, name: string, slug: string): Promise<TagEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client.update(tagsTable).set({ name, slug }).where(eq(tagsTable.id, id)).returning();
    return updated;
  }

  async deleteTx(tx: any, id: string): Promise<boolean> {
    const client = tx || this.db;
    const deleted = await client.delete(tagsTable).where(eq(tagsTable.id, id)).returning({ id: tagsTable.id });
    return deleted.length > 0;
  }
}
