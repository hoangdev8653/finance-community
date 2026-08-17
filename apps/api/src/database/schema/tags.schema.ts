import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const tagsTable = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique('uq_tags_name'),
  slug: varchar('slug', { length: 120 }).notNull().unique('uq_tags_slug'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
