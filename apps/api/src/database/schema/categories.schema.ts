import { pgTable, uuid, varchar, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    scope: varchar('scope', { length: 20 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_categories_scope_slug').on(table.scope, table.slug),
    unique('uq_categories_scope_name').on(table.scope, table.name),
  ],
);
