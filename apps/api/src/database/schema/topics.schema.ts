import { pgTable, uuid, varchar, text, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { domainsTable } from './domains.schema';
import { categoriesTable } from './categories.schema';

export const topicsTable = pgTable(
  'topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    domainId: uuid('domain_id').notNull().references(() => domainsTable.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id').references(() => categoriesTable.id, { onDelete: 'set null' }),
    parentId: uuid('parent_id').references((): any => topicsTable.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 140 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('uq_topics_domain_slug').on(table.domainId, table.slug)],
);

export type TopicEntity = typeof topicsTable.$inferSelect;
export type NewTopicEntity = typeof topicsTable.$inferInsert;
