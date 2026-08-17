import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull, desc, asc, count, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postsTable } from '../schema/posts.schema';

export type PostEntity = typeof postsTable.$inferSelect;
export type NewPostEntity = typeof postsTable.$inferInsert;

export interface PostFeedFilterOptions {
  contentType?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class PostsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewPostEntity): Promise<PostEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(postsTable).values(data).returning();
    return record;
  }

  async updateTx(tx: any, id: string, data: Partial<NewPostEntity>): Promise<PostEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(postsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(postsTable.id, id))
      .returning();
    return updated;
  }

  async findById(id: string): Promise<PostEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.id, id), isNull(postsTable.deletedAt)));
    return record;
  }

  async findBySlug(contentType: string, slug: string): Promise<PostEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(postsTable)
      .where(
        and(
          eq(postsTable.contentType, contentType),
          eq(postsTable.slug, slug),
          isNull(postsTable.deletedAt),
        ),
      );
    return record;
  }

  async findFeedPaginated(options: PostFeedFilterOptions): Promise<PaginatedResult<PostEntity>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [isNull(postsTable.deletedAt)];

    if (options.contentType) {
      conditions.push(eq(postsTable.contentType, options.contentType));
    }
    if (options.categoryId) {
      conditions.push(eq(postsTable.categoryId, options.categoryId));
    }
    if (options.authorId) {
      conditions.push(eq(postsTable.authorId, options.authorId));
    }
    if (options.status) {
      conditions.push(eq(postsTable.status, options.status));
    }

    const whereClause = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / limit);

    const orderDirection = options.order === 'ASC' ? asc : desc;
    const sortField = options.sortBy === 'publishedAt' ? postsTable.publishedAt : postsTable.createdAt;

    const records = await this.db
      .select()
      .from(postsTable)
      .where(whereClause)
      .orderBy(orderDirection(sortField), desc(postsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: records,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async softDeleteTx(tx: any, id: string): Promise<boolean> {
    const client = tx || this.db;
    const [updated] = await client
      .update(postsTable)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(postsTable.id, id))
      .returning();
    return !!updated;
  }

  async incrementViewCountTx(tx: any, id: string): Promise<void> {
    const client = tx || this.db;
    await client
      .update(postsTable)
      .set({ viewCount: sql`${postsTable.viewCount} + 1` })
      .where(eq(postsTable.id, id));
  }
}
