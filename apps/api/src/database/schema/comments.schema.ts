import { pgTable, uuid, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { usersTable } from './users.schema';
import { mediaTable } from './media.schema';

export const commentsTable = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    parentId: uuid('parent_id').references((): any => commentsTable.id, {
      onDelete: 'set null',
    }),
    body: text('body').notNull(),
    mediaId: uuid('media_id').references(() => mediaTable.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 20 }).notNull().default('VISIBLE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_comments_post_id').on(table.postId),
    index('idx_comments_author_id').on(table.authorId),
    index('idx_comments_status_created_at').on(table.status, table.createdAt),
  ],
);
