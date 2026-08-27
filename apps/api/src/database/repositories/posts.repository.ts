import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull, desc, asc, count, sql, inArray } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postsTable } from '../schema/posts.schema';
import { mediaTable } from '../schema/media.schema';
import { postTagsTable } from '../schema/post-tags.schema';
import { postTopicsTable } from '../schema/post-topics.schema';
import { profilesTable } from '../schema/profiles.schema';
import { followsTable } from '../schema/follows.schema';
import { domainsTable } from '../schema/domains.schema';

export type PostEntity = typeof postsTable.$inferSelect;
export type NewPostEntity = typeof postsTable.$inferInsert;

export interface PostFeedFilterOptions {
  contentType?: string;
  sourceType?: string;
  categoryId?: string;
  domainId?: string;
  tagId?: string;
  topicId?: string;
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

  async findByDomainSlug(domainSlug: string, slug: string): Promise<PostEntity | undefined> {
    const [record] = await this.db
      .select({ post: postsTable })
      .from(postsTable)
      .innerJoin(domainsTable, eq(postsTable.domainId, domainsTable.id))
      .where(and(eq(domainsTable.slug, domainSlug), eq(postsTable.slug, slug), isNull(postsTable.deletedAt)));
    return record?.post;
  }

  async findFeedPaginated(options: PostFeedFilterOptions): Promise<PaginatedResult<PostEntity>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [isNull(postsTable.deletedAt)];

    if (options.contentType) {
      conditions.push(eq(postsTable.contentType, options.contentType));
    }
    if (options.sourceType) {
      conditions.push(eq(postsTable.sourceType, options.sourceType));
    }
    if (options.categoryId) {
      conditions.push(eq(postsTable.categoryId, options.categoryId));
    }
    if (options.domainId) {
      conditions.push(eq(postsTable.domainId, options.domainId));
    }
    if (options.tagId) {
      const taggedPostIds = this.db
        .select({ postId: postTagsTable.postId })
        .from(postTagsTable)
        .where(eq(postTagsTable.tagId, options.tagId));
      conditions.push(inArray(postsTable.id, taggedPostIds));
    }
    if (options.topicId) {
      const topicPostIds = this.db
        .select({ postId: postTopicsTable.postId })
        .from(postTopicsTable)
        .where(eq(postTopicsTable.topicId, options.topicId));
      conditions.push(inArray(postsTable.id, topicPostIds));
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

  async findModerationPostsPaginated(
    moderationStatus?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<any>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const conditions = [isNull(postsTable.deletedAt)];
    if (moderationStatus && moderationStatus !== 'ALL') {
      conditions.push(eq(postsTable.moderationStatus, moderationStatus));
    }

    const whereClause = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({
        post: postsTable,
        author: {
          id: profilesTable.userId,
          username: profilesTable.username,
          displayName: profilesTable.displayName,
          avatarMediaId: profilesTable.avatarMediaId,
          badge: profilesTable.badge,
        },
        coverMedia: {
          id: mediaTable.id,
          secureUrl: mediaTable.secureUrl,
        },
      })
      .from(postsTable)
      .leftJoin(profilesTable, eq(postsTable.authorId, profilesTable.userId))
      .leftJoin(mediaTable, eq(postsTable.coverMediaId, mediaTable.id))
      .where(whereClause)
      .orderBy(desc(postsTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    const data = rows.map((r) => ({
      ...r.post,
      author: r.author,
      coverMedia: r.coverMedia,
    }));

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async updateModerationStatusTx(
    tx: any,
    id: string,
    data: {
      status?: string;
      moderationStatus: string;
      moderatedBy: string;
      moderationReason?: string | null;
    },
  ): Promise<PostEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(postsTable)
      .set({
        ...(data.status ? { status: data.status } : {}),
        moderationStatus: data.moderationStatus,
        moderatedBy: data.moderatedBy,
        moderatedAt: new Date(),
        moderationReason: data.moderationReason !== undefined ? data.moderationReason : null,
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, id))
      .returning();

    return updated;
  }

  async findFollowingFeedPaginated(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<PostEntity>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = and(
      eq(followsTable.followerId, userId),
      eq(postsTable.status, 'PUBLISHED'),
      isNull(postsTable.deletedAt),
    );

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postsTable)
      .innerJoin(followsTable, eq(postsTable.authorId, followsTable.followingId))
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({ post: postsTable })
      .from(postsTable)
      .innerJoin(followsTable, eq(postsTable.authorId, followsTable.followingId))
      .where(whereClause)
      .orderBy(desc(postsTable.publishedAt), desc(postsTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return {
      data: rows.map((r) => r.post),
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async findTrendingFeedPaginated(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<PostEntity>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = and(
      eq(postsTable.status, 'PUBLISHED'),
      isNull(postsTable.deletedAt),
    );

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select()
      .from(postsTable)
      .where(whereClause)
      .orderBy(desc(postsTable.viewCount), desc(postsTable.publishedAt), desc(postsTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return {
      data: rows,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async requestPostReviewTx(tx: any, id: string): Promise<PostEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(postsTable)
      .set({
        moderationStatus: 'UNREVIEWED',
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, id))
      .returning();
    return updated;
  }
}
