import { Injectable, Inject } from '@nestjs/common';
import { eq, and, asc, sql, count, inArray, or } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { categoriesTable } from '../schema/categories.schema';
import { postsTable } from '../schema/posts.schema';
import { commentsTable } from '../schema/comments.schema';
import { reportsTable } from '../schema/reports.schema';
import { notificationsTable } from '../schema/notifications.schema';

export type CategoryEntity = typeof categoriesTable.$inferSelect;
export type NewCategoryEntity = typeof categoriesTable.$inferInsert;

@Injectable()
export class CategoriesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async transaction<T>(work: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(work);
  }

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

  async getUsageCounts(id: string, tx?: any): Promise<{ posts: number; learningPaths: number }> {
    const client = tx || this.db;
    const [posts] = await client.select({ value: count() }).from(postsTable).where(eq(postsTable.categoryId, id));
    return { posts: Number(posts?.value ?? 0), learningPaths: 0 };
  }

  async reassignUsageTx(tx: any, oldId: string, newId: string): Promise<void> {
    await tx.update(postsTable).set({ categoryId: newId, updatedAt: new Date() }).where(eq(postsTable.categoryId, oldId));
  }

  async deleteContentsTx(tx: any, categoryId: string): Promise<{ posts: number; learningPaths: number }> {
    const postRows = await tx.select({ id: postsTable.id }).from(postsTable).where(eq(postsTable.categoryId, categoryId));
    const postIds = postRows.map((post: { id: string }) => post.id);
    if (postIds.length > 0) {
      const commentRows = await tx.select({ id: commentsTable.id })
        .from(commentsTable)
        .where(inArray(commentsTable.postId, postIds));
      const commentIds = commentRows.map((comment: { id: string }) => comment.id);
      const reportConditions = [inArray(reportsTable.reportedPostId, postIds)];
      if (commentIds.length > 0) reportConditions.push(inArray(reportsTable.reportedCommentId, commentIds));
      await tx.delete(reportsTable).where(or(...reportConditions));
      await tx.delete(notificationsTable).where(inArray(notificationsTable.referencePostId, postIds));
      await tx.delete(postsTable).where(inArray(postsTable.id, postIds));
    }

    return { posts: postIds.length, learningPaths: 0 };
  }
}
