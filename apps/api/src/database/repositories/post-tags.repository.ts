import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postTagsTable } from '../schema/post-tags.schema';
import { tagsTable } from '../schema/tags.schema';

export type PostTagEntity = typeof postTagsTable.$inferSelect;

@Injectable()
export class PostTagsRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByPostId(postId: string): Promise<PostTagEntity[]> {
    return this.db
      .select()
      .from(postTagsTable)
      .where(eq(postTagsTable.postId, postId));
  }

  async syncTagsTx(tx: any, postId: string, tagIds: string[]): Promise<void> {
    const client = tx || this.db;

    // Delete existing post_tags associations for this post
    await client.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

    if (tagIds && tagIds.length > 0) {
      const uniqueTagIds = Array.from(new Set(tagIds));
      const values = uniqueTagIds.map((tagId) => ({
        postId,
        tagId,
      }));

      await client
        .insert(postTagsTable)
        .values(values)
        .onConflictDoNothing({ target: [postTagsTable.postId, postTagsTable.tagId] });
    }
  }

  async getTagsForPost(postId: string): Promise<Array<{ id: string; name: string; slug: string }>> {
    return this.db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        slug: tagsTable.slug,
      })
      .from(postTagsTable)
      .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
      .where(eq(postTagsTable.postId, postId));
  }
}
