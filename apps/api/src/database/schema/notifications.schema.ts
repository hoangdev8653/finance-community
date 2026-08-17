import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { postsTable } from './posts.schema';
import { commentsTable } from './comments.schema';

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 30 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  referencePostId: uuid('reference_post_id').references(() => postsTable.id, { onDelete: 'set null' }),
  referenceCommentId: uuid('reference_comment_id').references(() => commentsTable.id, { onDelete: 'set null' }),
  referenceUserId: uuid('reference_user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
