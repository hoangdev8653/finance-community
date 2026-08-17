import { Injectable, Inject } from '@nestjs/common';
import { eq, and, count, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { followsTable } from '../schema/follows.schema';
import { profilesTable } from '../schema/profiles.schema';

export type FollowEntity = typeof followsTable.$inferSelect;

@Injectable()
export class FollowsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async followTx(tx: any, followerId: string, followingId: string): Promise<boolean> {
    const client = tx || this.db;
    await client
      .insert(followsTable)
      .values({ followerId, followingId })
      .onConflictDoNothing({ target: [followsTable.followerId, followsTable.followingId] });
    return true;
  }

  async unfollowTx(tx: any, followerId: string, followingId: string): Promise<boolean> {
    const client = tx || this.db;
    await client
      .delete(followsTable)
      .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)));
    return true;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [record] = await this.db
      .select()
      .from(followsTable)
      .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)));
    return !!record;
  }

  async findFollowersPaginated(followingId: string, page = 1, limit = 20): Promise<{ data: any[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(followsTable)
      .where(eq(followsTable.followingId, followingId));

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({
        followerId: followsTable.followerId,
        followedAt: followsTable.createdAt,
        profile: {
          userId: profilesTable.userId,
          username: profilesTable.username,
          displayName: profilesTable.displayName,
          avatarMediaId: profilesTable.avatarMediaId,
        },
      })
      .from(followsTable)
      .leftJoin(profilesTable, eq(followsTable.followerId, profilesTable.userId))
      .where(eq(followsTable.followingId, followingId))
      .orderBy(desc(followsTable.createdAt))
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

  async findFollowingPaginated(followerId: string, page = 1, limit = 20): Promise<{ data: any[]; meta: any }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(followsTable)
      .where(eq(followsTable.followerId, followerId));

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    const rows = await this.db
      .select({
        followingId: followsTable.followingId,
        followedAt: followsTable.createdAt,
        profile: {
          userId: profilesTable.userId,
          username: profilesTable.username,
          displayName: profilesTable.displayName,
          avatarMediaId: profilesTable.avatarMediaId,
        },
      })
      .from(followsTable)
      .leftJoin(profilesTable, eq(followsTable.followingId, profilesTable.userId))
      .where(eq(followsTable.followerId, followerId))
      .orderBy(desc(followsTable.createdAt))
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
}
