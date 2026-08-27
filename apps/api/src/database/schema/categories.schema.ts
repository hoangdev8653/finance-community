import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { domainsTable } from './domains.schema';

export const categoriesTable = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    scope: varchar('scope', { length: 20 }).notNull(),
    domainId: uuid('domain_id').references(() => domainsTable.id, { onDelete: 'restrict' }),
    parentId: uuid('parent_id').references((): any => categoriesTable.id, { onDelete: 'set null' }),
    nameVi: varchar('name_vi', { length: 100 }),
    nameEn: varchar('name_en', { length: 100 }),
    contentTypes: jsonb('content_types').$type<string[]>().notNull().default([]),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    isPromoted: boolean('is_promoted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_categories_scope_slug').on(table.scope, table.slug),
    unique('uq_categories_scope_name').on(table.scope, table.name),
  ],
);
