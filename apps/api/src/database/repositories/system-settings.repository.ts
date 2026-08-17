import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { systemSettingsTable } from '../schema/system-settings.schema';

export type SystemSettingEntity = typeof systemSettingsTable.$inferSelect;

@Injectable()
export class SystemSettingsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByKey(key: string): Promise<SystemSettingEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(systemSettingsTable)
      .where(eq(systemSettingsTable.key, key));
    return record;
  }

  async upsertTx(tx: any, key: string, value: Record<string, any>, description?: string): Promise<SystemSettingEntity> {
    const client = tx || this.db;
    const existing = await this.findByKey(key);

    if (existing) {
      const [updated] = await client
        .update(systemSettingsTable)
        .set({ value, description: description !== undefined ? description : existing.description, updatedAt: new Date() })
        .where(eq(systemSettingsTable.key, key))
        .returning();
      return updated;
    } else {
      const [inserted] = await client
        .insert(systemSettingsTable)
        .values({ key, value, description: description || null })
        .returning();
      return inserted;
    }
  }

  async findAll(): Promise<SystemSettingEntity[]> {
    return this.db.select().from(systemSettingsTable);
  }
}
