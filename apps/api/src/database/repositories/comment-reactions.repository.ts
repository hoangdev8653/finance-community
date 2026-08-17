import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { commentReactionsTable } from '../schema/comment-reactions.schema';

export type CommentReactionEntity = typeof commentReactionsTable.$inferSelect;

@Injectable()
export class CommentReactionsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findReaction(userId: string, commentId: string): Promise<CommentReactionEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(commentReactionsTable)
      .where(and(eq(commentReactionsTable.userId, userId), eq(commentReactionsTable.commentId, commentId)));
    return record;
  }

  async toggleReactionTx(
    tx: any,
    userId: string,
    commentId: string,
    reactionType = 'LIKE',
  ): Promise<{ reacted: boolean; reactionType: string | null }> {
    const client = tx || this.db;

    const inserted = await client
      .insert(commentReactionsTable)
      .values({ userId, commentId, reactionType })
      .onConflictDoNothing({ target: [commentReactionsTable.userId, commentReactionsTable.commentId] })
      .returning();

    if (inserted.length === 0) {
      // Row already existed -> Atomic Delete (Unlike)
      await client
        .delete(commentReactionsTable)
        .where(and(eq(commentReactionsTable.userId, userId), eq(commentReactionsTable.commentId, commentId)));
      return { reacted: false, reactionType: null };
    }

    return { reacted: true, reactionType };
  }

  async getReactionCounts(commentId: string, currentUserId?: string): Promise<{ total: number; userReacted: boolean }> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(commentReactionsTable)
      .where(eq(commentReactionsTable.commentId, commentId));

    let userReacted = false;
    if (currentUserId) {
      const existing = await this.findReaction(currentUserId, commentId);
      userReacted = !!existing;
    }

    return { total: Number(total), userReacted };
  }
}
