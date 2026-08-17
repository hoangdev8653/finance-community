import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { postsTable } from './posts.schema';

export const postReactionsTable = pgTable(
  'post_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id, { onDelete: 'cascade' }),
    reactionType: varchar('reaction_type', { length: 20 }).notNull().default('LIKE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_post_reactions_user_post').on(table.userId, table.postId),
  ],
);
