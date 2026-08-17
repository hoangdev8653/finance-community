import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { usersTable } from './users.schema';

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
    status: varchar('status', { length: 20 }).notNull().default('VISIBLE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
);
