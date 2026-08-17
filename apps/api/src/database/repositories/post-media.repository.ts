import { Injectable, Inject } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { postMediaTable } from '../schema/post-media.schema';
import { mediaTable } from '../schema/media.schema';

export type PostMediaEntity = typeof postMediaTable.$inferSelect;

export interface PostMediaItemInput {
  mediaId: string;
  sortOrder?: number;
}

@Injectable()
export class PostMediaRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async findByPostId(postId: string): Promise<PostMediaEntity[]> {
    return this.db
      .select()
      .from(postMediaTable)
      .where(eq(postMediaTable.postId, postId))
      .orderBy(asc(postMediaTable.sortOrder));
  }

  async syncMediaTx(tx: any, postId: string, mediaItems: PostMediaItemInput[]): Promise<void> {
    const client = tx || this.db;

    // Delete existing post_media associations for this post
    await client.delete(postMediaTable).where(eq(postMediaTable.postId, postId));

    if (mediaItems && mediaItems.length > 0) {
      // Deduplicate mediaIds maintaining first occurrence order
      const seen = new Set<string>();
      const values: Array<{ postId: string; mediaId: string; sortOrder: number }> = [];

      mediaItems.forEach((item, idx) => {
        if (!seen.has(item.mediaId)) {
          seen.add(item.mediaId);
          values.push({
            postId,
            mediaId: item.mediaId,
            sortOrder: item.sortOrder ?? idx,
          });
        }
      });

      if (values.length > 0) {
        await client
          .insert(postMediaTable)
          .values(values)
          .onConflictDoNothing({ target: [postMediaTable.postId, postMediaTable.mediaId] });
      }
    }
  }

  async getMediaForPost(postId: string): Promise<Array<{ id: string; secureUrl: string; purpose: string; sortOrder: number }>> {
    return this.db
      .select({
        id: mediaTable.id,
        secureUrl: mediaTable.secureUrl,
        purpose: mediaTable.purpose,
        sortOrder: postMediaTable.sortOrder,
      })
      .from(postMediaTable)
      .innerJoin(mediaTable, eq(postMediaTable.mediaId, mediaTable.id))
      .where(eq(postMediaTable.postId, postId))
      .orderBy(asc(postMediaTable.sortOrder));
  }
}
