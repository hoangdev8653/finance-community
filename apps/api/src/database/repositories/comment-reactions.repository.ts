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

    const [existing] = await client
      .select()
      .from(commentReactionsTable)
      .where(and(eq(commentReactionsTable.userId, userId), eq(commentReactionsTable.commentId, commentId)));

    if (existing) {
      if (existing.reactionType === reactionType) {
        // Same reaction type -> toggle off (Unlike)
        await client
          .delete(commentReactionsTable)
          .where(and(eq(commentReactionsTable.userId, userId), eq(commentReactionsTable.commentId, commentId)));
        return { reacted: false, reactionType: null };
      } else {
        // Different reaction type -> update to new reaction type
        await client
          .update(commentReactionsTable)
          .set({ reactionType, createdAt: new Date() })
          .where(and(eq(commentReactionsTable.userId, userId), eq(commentReactionsTable.commentId, commentId)));
        return { reacted: true, reactionType };
      }
    }

    // New reaction
    await client
      .insert(commentReactionsTable)
      .values({ userId, commentId, reactionType });

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
