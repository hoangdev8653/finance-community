import { Injectable, Inject, Optional } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { authCredentialsTable } from '../schema/auth-credentials.schema';

export type AuthCredentialEntity = typeof authCredentialsTable.$inferSelect;
export type NewAuthCredentialEntity = typeof authCredentialsTable.$inferInsert;

@Injectable()
export class AuthCredentialsRepository {
  constructor(
    @Optional() @Inject(DRIZZLE_TOKEN) private readonly db?: DrizzleDB,
  ) {}

  async findByUserId(userId: string): Promise<AuthCredentialEntity | undefined> {
    if (!this.db) return undefined;
    const [record] = await this.db
      .select()
      .from(authCredentialsTable)
      .where(eq(authCredentialsTable.userId, userId));
    return record;
  }

  async upsertCredentialTx(tx: any, userId: string, passwordHash: string): Promise<AuthCredentialEntity | undefined> {
    const client = tx || this.db;
    if (!client) return undefined;

    const [record] = await client
      .insert(authCredentialsTable)
      .values({
        userId,
        passwordHash,
      })
      .onConflictDoUpdate({
        target: authCredentialsTable.userId,
        set: {
          passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning();
    return record;
  }

  async deleteByUserIdTx(tx: any, userId: string): Promise<boolean> {
    const client = tx || this.db;
    if (!client) return false;

    await client
      .delete(authCredentialsTable)
      .where(eq(authCredentialsTable.userId, userId));
    return true;
  }
}
