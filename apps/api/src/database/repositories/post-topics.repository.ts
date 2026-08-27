import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postTopicsTable } from '../schema/post-topics.schema';
import { topicsTable } from '../schema/topics.schema';

@Injectable()
export class PostTopicsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async syncTopicsTx(tx: any, postId: string, topicIds: string[]): Promise<void> {
    const client = tx || this.db;

    await client.delete(postTopicsTable).where(eq(postTopicsTable.postId, postId));

    const uniqueTopicIds = Array.from(new Set(topicIds));
    if (uniqueTopicIds.length === 0) return;

    await client
      .insert(postTopicsTable)
      .values(uniqueTopicIds.map((topicId) => ({ postId, topicId })))
      .onConflictDoNothing({ target: [postTopicsTable.postId, postTopicsTable.topicId] });
  }

  async getTopicsForPost(postId: string): Promise<Array<{ id: string; name: string; slug: string; domainId: string; categoryId: string | null }>> {
    return this.db
      .select({
        id: topicsTable.id,
        name: topicsTable.name,
        slug: topicsTable.slug,
        domainId: topicsTable.domainId,
        categoryId: topicsTable.categoryId,
      })
      .from(postTopicsTable)
      .innerJoin(topicsTable, eq(postTopicsTable.topicId, topicsTable.id))
      .where(eq(postTopicsTable.postId, postId));
  }
}
