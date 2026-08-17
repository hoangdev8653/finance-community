import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const profilesTable = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique('uq_profiles_user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 50 }).notNull().unique('uq_profiles_username'),
  displayName: varchar('display_name', { length: 100 }),
  avatarMediaId: uuid('avatar_media_id'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
