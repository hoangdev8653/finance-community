import { Injectable, Inject } from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
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

  async findByScopeAndSlug(scope: string, slug: string): Promise<CategoryEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.scope, scope), eq(categoriesTable.slug, slug)));
    return record;
  }

  async findAllByScope(scope?: string): Promise<CategoryEntity[]> {
    if (scope) {
      return this.db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.scope, scope))
        .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
    }
    return this.db
      .select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
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
}
