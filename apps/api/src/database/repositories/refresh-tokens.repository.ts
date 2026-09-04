import { Injectable, Inject, Optional } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { refreshTokensTable } from '../schema/refresh-tokens.schema';

export type RefreshTokenEntity = typeof refreshTokensTable.$inferSelect;
export type NewRefreshTokenEntity = typeof refreshTokensTable.$inferInsert;

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @Optional() @Inject(DRIZZLE_TOKEN) private readonly db?: DrizzleDB,
  ) {}

  async createTokenTx(tx: any, data: NewRefreshTokenEntity): Promise<RefreshTokenEntity | undefined> {
    const client = tx || this.db;
    if (!client) return undefined;

    const [record] = await client.insert(refreshTokensTable).values(data).returning();
    return record;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | undefined> {
    if (!this.db) return undefined;

    const [record] = await this.db
      .select()
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, tokenHash));
    return record;
  }

  async revokeTokenTx(tx: any, id: string): Promise<boolean> {
    const client = tx || this.db;
    if (!client) return false;

    const [updated] = await client
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.id, id))
      .returning();
    return !!updated;
  }

  async revokeFamilyTx(tx: any, family: string): Promise<boolean> {
    const client = tx || this.db;
    if (!client) return false;

    await client
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.family, family));
    return true;
  }

  async revokeAllUserTokensTx(tx: any, userId: string): Promise<boolean> {
    const client = tx || this.db;
    if (!client) return false;

    await client
      .update(refreshTokensTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokensTable.userId, userId));
    return true;
  }
}
