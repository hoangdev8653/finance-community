import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, count, isNull } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postBookmarksTable } from '../schema/post-bookmarks.schema';
import { postsTable } from '../schema/posts.schema';

export type PostBookmarkEntity = typeof postBookmarksTable.$inferSelect;

export interface BookmarkedPostResult {
  data: Array<typeof postsTable.$inferSelect & { bookmarkedAt: Date }>;
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
export class PostBookmarksRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async isBookmarked(userId: string, postId: string): Promise<boolean> {
    const [record] = await this.db
      .select({ id: postBookmarksTable.id })
      .from(postBookmarksTable)
      .where(and(eq(postBookmarksTable.userId, userId), eq(postBookmarksTable.postId, postId)));
    return !!record;
  }

  async toggleBookmarkTx(
    tx: any,
    userId: string,
    postId: string,
  ): Promise<{ bookmarked: boolean }> {
    const client = tx || this.db;

    const [existing] = await client
      .select({ id: postBookmarksTable.id })
      .from(postBookmarksTable)
      .where(and(eq(postBookmarksTable.userId, userId), eq(postBookmarksTable.postId, postId)));

    if (existing) {
      await client
        .delete(postBookmarksTable)
        .where(and(eq(postBookmarksTable.userId, userId), eq(postBookmarksTable.postId, postId)));
      return { bookmarked: false };
    }

    await client
      .insert(postBookmarksTable)
      .values({ userId, postId });

    return { bookmarked: true };
  }

  async findUserBookmarksPaginated(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<BookmarkedPostResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = and(
      eq(postBookmarksTable.userId, userId),
      eq(postsTable.status, 'PUBLISHED'),
      isNull(postsTable.deletedAt),
    );

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postBookmarksTable)
      .innerJoin(postsTable, eq(postBookmarksTable.postId, postsTable.id))
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({
        post: postsTable,
        bookmarkedAt: postBookmarksTable.createdAt,
      })
      .from(postBookmarksTable)
      .innerJoin(postsTable, eq(postBookmarksTable.postId, postsTable.id))
      .where(whereClause)
      .orderBy(desc(postBookmarksTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    const data = rows.map((r) => ({
      ...r.post,
      bookmarkedAt: r.bookmarkedAt,
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
}
