import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { postsTable } from './posts.schema';

export const postBookmarksTable = pgTable(
  'post_bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_post_bookmarks_user_post').on(table.userId, table.postId),
  ],
);
