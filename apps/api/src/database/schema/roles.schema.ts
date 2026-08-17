import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique('uq_roles_name'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
