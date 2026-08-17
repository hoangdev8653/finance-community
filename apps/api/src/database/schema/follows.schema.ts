import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const followsTable = pgTable(
  'follows',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    followerId: uuid('follower_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_follows_follower_following').on(table.followerId, table.followingId),
  ],
);
