import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { topicsTable } from './topics.schema';

export const postTopicsTable = pgTable(
  'post_topics',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topicsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.topicId], name: 'pk_post_topics' }),
  ],
);

export type PostTopicEntity = typeof postTopicsTable.$inferSelect;
