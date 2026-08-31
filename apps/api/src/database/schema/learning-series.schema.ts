import { pgTable, uuid, varchar, text, integer, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { domainsTable } from './domains.schema';
import { categoriesTable } from './categories.schema';
import { postsTable } from './posts.schema';

export const learningSeriesTable = pgTable('learning_series', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 320 }).notNull().unique(),
  description: text('description'),
  domainId: uuid('domain_id').notNull().references(() => domainsTable.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id').notNull().references(() => categoriesTable.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
  isPublished: boolean('is_published').notNull().default(false),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('idx_learning_series_domain_category').on(table.domainId, table.categoryId)]);

export const learningSeriesPostsTable = pgTable('learning_series_posts', {
  seriesId: uuid('series_id').notNull().references(() => learningSeriesTable.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  lessonOrder: integer('lesson_order').notNull(),
  isRequired: boolean('is_required').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique('uq_learning_series_post').on(table.seriesId, table.postId), unique('uq_learning_series_order').on(table.seriesId, table.lessonOrder)]);

export type LearningSeriesEntity = typeof learningSeriesTable.$inferSelect;
export type NewLearningSeriesEntity = typeof learningSeriesTable.$inferInsert;
