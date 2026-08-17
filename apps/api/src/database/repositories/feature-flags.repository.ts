import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { featureFlagsTable } from '../schema/feature-flags.schema';

export type FeatureFlagEntity = typeof featureFlagsTable.$inferSelect;

@Injectable()
export class FeatureFlagsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByKey(key: string): Promise<FeatureFlagEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(featureFlagsTable)
      .where(eq(featureFlagsTable.key, key));
    return record;
  }

  async toggleTx(tx: any, key: string, isEnabled: boolean, description?: string): Promise<FeatureFlagEntity> {
    const client = tx || this.db;
    const existing = await this.findByKey(key);

    if (existing) {
      const [updated] = await client
        .update(featureFlagsTable)
        .set({ isEnabled, description: description !== undefined ? description : existing.description, updatedAt: new Date() })
        .where(eq(featureFlagsTable.key, key))
        .returning();
      return updated;
    } else {
      const [inserted] = await client
        .insert(featureFlagsTable)
        .values({ key, isEnabled, description: description || null })
        .returning();
      return inserted;
    }
  }

  async findAll(): Promise<FeatureFlagEntity[]> {
    return this.db.select().from(featureFlagsTable);
  }
}
