import { pgTable, uuid, varchar, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { mediaTable } from './media.schema';
import { categoriesTable } from './categories.schema';

export const postsTable = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict' }),
    contentType: varchar('content_type', { length: 20 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    slug: varchar('slug', { length: 350 }).notNull(),
    body: text('body'),
    coverMediaId: uuid('cover_media_id').references(() => mediaTable.id, { onDelete: 'set null' }),
    categoryId: uuid('category_id').references(() => categoriesTable.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    moderationStatus: varchar('moderation_status', { length: 20 }).notNull().default('UNREVIEWED'),
    moderatedBy: uuid('moderated_by').references(() => usersTable.id, { onDelete: 'set null' }),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
    moderationReason: text('moderation_reason'),
    metaTitle: varchar('meta_title', { length: 70 }),
    metaDescription: varchar('meta_description', { length: 160 }),
    sourceType: varchar('source_type', { length: 20 }).notNull().default('USER'),
    sourceUrl: varchar('source_url', { length: 500 }),
    sourceName: varchar('source_name', { length: 100 }),
    viewCount: integer('view_count').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    unique('uq_posts_content_type_slug').on(table.contentType, table.slug),
  ],
);
