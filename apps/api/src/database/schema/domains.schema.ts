import { pgTable, uuid, varchar, text, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core';

export const domainsTable = pgTable(
  'domains',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull(),
    slug: varchar('slug', { length: 80 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    nameVi: varchar('name_vi', { length: 120 }),
    nameEn: varchar('name_en', { length: 120 }),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    isPromoted: boolean('is_promoted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('uq_domains_code').on(table.code), unique('uq_domains_slug').on(table.slug)],
);

export type DomainEntity = typeof domainsTable.$inferSelect;
export type NewDomainEntity = typeof domainsTable.$inferInsert;
