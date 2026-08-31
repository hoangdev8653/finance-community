import { pgTable, uuid, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';

export const learningSourcesTable = pgTable('learning_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 300 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  publisher: varchar('publisher', { length: 200 }),
  sourceType: varchar('source_type', { length: 30 }).notNull().default('REFERENCE'),
  checkedAt: timestamp('checked_at', { withTimezone: true }),
  isPublic: boolean('is_public').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('idx_learning_sources_post_id').on(table.postId)]);
