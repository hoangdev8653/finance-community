import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const authCredentialsTable = pgTable('auth_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique('uq_auth_credentials_user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
