import { pgTable, uuid, integer, unique } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { mediaTable } from './media.schema';

export const postMediaTable = pgTable(
  'post_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    mediaId: uuid('media_id')
      .notNull()
      .references(() => mediaTable.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    unique('uq_post_media_post_media').on(table.postId, table.mediaId),
  ],
);
