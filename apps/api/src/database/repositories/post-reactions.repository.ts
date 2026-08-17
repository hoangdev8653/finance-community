import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postReactionsTable } from '../schema/post-reactions.schema';

export type PostReactionEntity = typeof postReactionsTable.$inferSelect;

@Injectable()
export class PostReactionsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findReaction(userId: string, postId: string): Promise<PostReactionEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(postReactionsTable)
      .where(and(eq(postReactionsTable.userId, userId), eq(postReactionsTable.postId, postId)));
    return record;
  }

  async toggleReactionTx(
    tx: any,
    userId: string,
    postId: string,
    reactionType = 'LIKE',
  ): Promise<{ reacted: boolean; reactionType: string | null }> {
    const client = tx || this.db;

    const inserted = await client
      .insert(postReactionsTable)
      .values({ userId, postId, reactionType })
      .onConflictDoNothing({ target: [postReactionsTable.userId, postReactionsTable.postId] })
      .returning();

    if (inserted.length === 0) {
      // Row already existed -> Atomic Delete (Unlike)
      await client
        .delete(postReactionsTable)
        .where(and(eq(postReactionsTable.userId, userId), eq(postReactionsTable.postId, postId)));
      return { reacted: false, reactionType: null };
    }

    return { reacted: true, reactionType };
  }

  async getReactionCounts(postId: string, currentUserId?: string): Promise<{ total: number; userReacted: boolean }> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postReactionsTable)
      .where(eq(postReactionsTable.postId, postId));

    let userReacted = false;
    if (currentUserId) {
      const existing = await this.findReaction(currentUserId, postId);
      userReacted = !!existing;
    }

    return { total: Number(total), userReacted };
  }
}
