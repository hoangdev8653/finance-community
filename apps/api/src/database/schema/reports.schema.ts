import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { postsTable } from './posts.schema';
import { commentsTable } from './comments.schema';

export const reportsTable = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => usersTable.id, { onDelete: 'set null' }),
  reportedPostId: uuid('reported_post_id').references(() => postsTable.id, { onDelete: 'restrict' }),
  reportedCommentId: uuid('reported_comment_id').references(() => commentsTable.id, { onDelete: 'restrict' }),
  reportedUserId: uuid('reported_user_id').references(() => usersTable.id, { onDelete: 'restrict' }),
  reason: varchar('reason', { length: 100 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('OPEN'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});
