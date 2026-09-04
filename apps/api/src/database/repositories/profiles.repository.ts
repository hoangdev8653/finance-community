import { Injectable, Inject } from '@nestjs/common';
import { eq, and, ne, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { profilesTable } from '../schema/profiles.schema';

export type ProfileEntity = typeof profilesTable.$inferSelect;
export type NewProfileEntity = typeof profilesTable.$inferInsert;

@Injectable()
export class ProfilesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByUserId(userId: string): Promise<ProfileEntity | undefined> {
    return this.findByUserIdTx(undefined, userId);
  }

  async findByUserIdTx(tx: any, userId: string): Promise<ProfileEntity | undefined> {
    const client = tx || this.db;
    const [profile] = await client.select().from(profilesTable).where(eq(profilesTable.userId, userId));
    return profile;
  }

  async findByUsername(username: string): Promise<ProfileEntity | undefined> {
    const [profile] = await this.db.select().from(profilesTable).where(eq(profilesTable.username, username));
    return profile;
  }

  async isUsernameTakenTx(tx: any, username: string, currentUserId: string): Promise<boolean> {
    const client = tx || this.db;
    const [profile] = await client
      .select({ id: profilesTable.id })
      .from(profilesTable)
      .where(and(eq(profilesTable.username, username), ne(profilesTable.userId, currentUserId)));
    return !!profile;
  }

  async upsertProfileTx(tx: any, data: NewProfileEntity): Promise<ProfileEntity | undefined> {
    const client = tx || this.db;
    const [profile] = await client
      .insert(profilesTable)
      .values(data)
      .onConflictDoNothing({
        target: profilesTable.userId,
      })
      .returning();
    return profile;
  }

  async updateProfileTx(
    tx: any,
    userId: string,
    data: Partial<Pick<ProfileEntity, 'displayName' | 'bio' | 'avatarMediaId'>>,
  ): Promise<ProfileEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(profilesTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, userId))
      .returning();
    return updated;
  }

  async syncGoogleProfileTx(tx: any, userId: string, data: { displayName: string; avatarUrl: string | null }): Promise<void> {
    const client = tx || this.db;
    await client
      .update(profilesTable)
      .set({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, userId));
  }

  async incrementReputationScoreTx(tx: any, userId: string, points: number): Promise<void> {
    const client = tx || this.db;
    await client
      .update(profilesTable)
      .set({
        reputationScore: sql`${profilesTable.reputationScore} + ${points}`,
        updatedAt: new Date(),
      })
      .where(eq(profilesTable.userId, userId));
  }
}
