import { Injectable, Inject } from '@nestjs/common';
import { eq, and, asc, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { categoriesTable } from '../schema/categories.schema';

export type CategoryEntity = typeof categoriesTable.$inferSelect;
export type NewCategoryEntity = typeof categoriesTable.$inferInsert;

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewCategoryEntity): Promise<CategoryEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(categoriesTable).values(data).returning();
    return record;
  }

  async findById(id: string): Promise<CategoryEntity | undefined> {
    const [record] = await this.db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    return record;
  }

  async findAll(filters: { scope?: string; domainId?: string; contentType?: string; parentId?: string; isActive?: boolean } = {}): Promise<CategoryEntity[]> {
    const conditions = [];
    if (filters.scope) conditions.push(eq(categoriesTable.scope, filters.scope));
    if (filters.domainId) conditions.push(eq(categoriesTable.domainId, filters.domainId));
    if (filters.parentId) conditions.push(eq(categoriesTable.parentId, filters.parentId));
    if (filters.isActive !== undefined) conditions.push(eq(categoriesTable.isActive, filters.isActive));
    if (filters.contentType) {
      conditions.push(sql`${categoriesTable.contentTypes} @> ${JSON.stringify([filters.contentType])}::jsonb`);
    }
    return this.db
      .select()
      .from(categoriesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
  }

  async findByScopeAndSlug(scope: string, slug: string): Promise<CategoryEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.scope, scope), eq(categoriesTable.slug, slug)));
    return record;
  }

  async updateTx(tx: any, id: string, data: Partial<NewCategoryEntity>): Promise<CategoryEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(categoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    return updated;
  }

  async deleteTx(tx: any, id: string): Promise<CategoryEntity | undefined> {
    const client = tx || this.db;
    const [deleted] = await client.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    return deleted;
  }
}
