import { pgTable, uuid, unique } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { tagsTable } from './tags.schema';

export const postTagsTable = pgTable(
  'post_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id, { onDelete: 'restrict' }),
  },
  (table) => [
    unique('uq_post_tags_post_tag').on(table.postId, table.tagId),
  ],
);
