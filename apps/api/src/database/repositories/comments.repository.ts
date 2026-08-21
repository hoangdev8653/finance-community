import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull, asc, count } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { commentsTable } from '../schema/comments.schema';
import { profilesTable } from '../schema/profiles.schema';
import { mediaTable } from '../schema/media.schema';

export type CommentEntity = typeof commentsTable.$inferSelect;
export type NewCommentEntity = typeof commentsTable.$inferInsert;

export interface CommentWithProfile extends CommentEntity {
  authorProfile?: {
    username: string;
    displayName: string | null;
    avatarMediaId: string | null;
  } | null;
  media?: {
    id: string;
    secureUrl: string;
  } | null;
}

@Injectable()
export class CommentsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewCommentEntity): Promise<CommentEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(commentsTable).values(data).returning();
    return record;
  }

  async updateTx(tx: any, id: string, data: Partial<NewCommentEntity>): Promise<CommentEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(commentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(commentsTable.id, id))
      .returning();
    return updated;
  }

  async findById(id: string): Promise<CommentEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, id));
    return record;
  }

  async findThreadByPostId(postId: string, page = 1, limit = 20): Promise<{ data: CommentWithProfile[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const whereClause = and(
      eq(commentsTable.postId, postId),
      eq(commentsTable.status, 'VISIBLE'),
      isNull(commentsTable.deletedAt),
    );

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(commentsTable)
      .where(whereClause);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({
        comment: commentsTable,
        profile: {
          username: profilesTable.username,
          displayName: profilesTable.displayName,
          avatarMediaId: profilesTable.avatarMediaId,
        },
        media: {
          id: mediaTable.id,
          secureUrl: mediaTable.secureUrl,
        },
      })
      .from(commentsTable)
      .leftJoin(profilesTable, eq(commentsTable.authorId, profilesTable.userId))
      .leftJoin(mediaTable, eq(commentsTable.mediaId, mediaTable.id))
      .where(whereClause)
      .orderBy(asc(commentsTable.createdAt))
      .limit(safeLimit)
      .offset(offset);

    const data: CommentWithProfile[] = rows.map((r) => ({
      ...r.comment,
      authorProfile: r.profile,
      media: r.media && r.media.id ? r.media : null,
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

  async softDeleteTx(tx: any, id: string): Promise<boolean> {
    const client = tx || this.db;
    const [updated] = await client
      .update(commentsTable)
      .set({ deletedAt: new Date(), status: 'HIDDEN', updatedAt: new Date() })
      .where(and(eq(commentsTable.id, id), isNull(commentsTable.deletedAt)))
      .returning();
    return !!updated;
  }
}
