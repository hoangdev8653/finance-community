import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { mediaTable } from '../schema/media.schema';

export type MediaEntity = typeof mediaTable.$inferSelect;
export type NewMediaEntity = typeof mediaTable.$inferInsert;

@Injectable()
export class MediaRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}

  async createTx(tx: any, data: NewMediaEntity): Promise<MediaEntity> {
    const client = tx || this.db;
    const [record] = await client.insert(mediaTable).values(data).returning();
    return record;
  }

  async findById(id: string): Promise<MediaEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(mediaTable)
      .where(and(eq(mediaTable.id, id), isNull(mediaTable.deletedAt)));
    return record;
  }

  async findByCloudinaryPublicId(cloudinaryPublicId: string): Promise<MediaEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(mediaTable)
      .where(and(eq(mediaTable.cloudinaryPublicId, cloudinaryPublicId), isNull(mediaTable.deletedAt)));
    return record;
  }

  async findBySecureUrl(secureUrl: string): Promise<MediaEntity | undefined> {
    const [record] = await this.db
      .select()
      .from(mediaTable)
      .where(and(eq(mediaTable.secureUrl, secureUrl), isNull(mediaTable.deletedAt)));
    return record;
  }

  async findByContentHash(contentHash: string): Promise<MediaEntity | undefined> {
    const [record] = await this.db.select().from(mediaTable).where(and(eq(mediaTable.contentHash, contentHash), isNull(mediaTable.deletedAt)));
    return record;
  }

  async softDeleteTx(tx: any, id: string): Promise<boolean> {
    const client = tx || this.db;
    const [updated] = await client
      .update(mediaTable)
      .set({ deletedAt: new Date() })
      .where(eq(mediaTable.id, id))
      .returning();
    return !!updated;
  }
}
