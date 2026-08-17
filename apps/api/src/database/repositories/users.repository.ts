import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { usersTable } from '../schema/users.schema';

export type UserEntity = typeof usersTable.$inferSelect;
export type NewUserEntity = typeof usersTable.$inferInsert;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<UserEntity | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  }

  async upsertUserTx(tx: any, data: NewUserEntity): Promise<UserEntity> {
    const client = tx || this.db;
    const [user] = await client
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: data.email,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateStatus(id: string, status: UserEntity['status']): Promise<UserEntity | undefined> {
    return this.updateStatusTx(undefined, id, status);
  }

  async updateStatusTx(tx: any, id: string, status: UserEntity['status']): Promise<UserEntity | undefined> {
    const client = tx || this.db;
    const [updated] = await client
      .update(usersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return updated;
  }
}
