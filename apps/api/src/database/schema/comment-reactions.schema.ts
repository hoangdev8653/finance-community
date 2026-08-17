import { pgTable, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { commentsTable } from './comments.schema';

export const commentReactionsTable = pgTable(
  'comment_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => commentsTable.id, { onDelete: 'cascade' }),
    reactionType: varchar('reaction_type', { length: 20 }).notNull().default('LIKE'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_comment_reactions_user_comment').on(table.userId, table.commentId),
  ],
);
