import { Injectable, Inject } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { topicsTable } from '../schema/topics.schema';

export type TopicEntity = typeof topicsTable.$inferSelect;

@Injectable()
export class TopicsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByIds(ids: string[]): Promise<TopicEntity[]> {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return [];

    return this.db
      .select()
      .from(topicsTable)
      .where(inArray(topicsTable.id, uniqueIds));
  }
}
