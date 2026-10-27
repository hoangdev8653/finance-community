import { pgTable, uuid, varchar, text, integer, boolean, timestamp, unique, jsonb } from 'drizzle-orm/pg-core';
import { domainsTable } from './domains.schema';
import { postsTable } from './posts.schema';
import { mediaTable } from './media.schema';

export const learningSeriesTable = pgTable('learning_series', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 320 }).notNull().unique(),
  description: text('description'),
  learningOutcomes: jsonb('learning_outcomes').$type<string[]>().notNull().default([]),
  heroMediaId: uuid('hero_media_id').references(() => mediaTable.id, { onDelete: 'set null' }),
  heroAltText: varchar('hero_alt_text', { length: 250 }),
  domainId: uuid('domain_id').notNull().references(() => domainsTable.id, { onDelete: 'restrict' }),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
  isPublished: boolean('is_published').notNull().default(false),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const learningSeriesPostsTable = pgTable('learning_series_posts', {
  seriesId: uuid('series_id').notNull().references(() => learningSeriesTable.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  lessonOrder: integer('lesson_order').notNull(),
  isRequired: boolean('is_required').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique('uq_learning_series_post').on(table.seriesId, table.postId), unique('uq_learning_series_order').on(table.seriesId, table.lessonOrder)]);

export type LearningSeriesEntity = typeof learningSeriesTable.$inferSelect;
export type NewLearningSeriesEntity = typeof learningSeriesTable.$inferInsert;
