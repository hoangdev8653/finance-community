import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { reportsTable } from './reports.schema';

export const moderationActionsTable = pgTable('moderation_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  moderatorId: uuid('moderator_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  reportId: uuid('report_id').references(() => reportsTable.id, { onDelete: 'set null' }),
  actionType: varchar('action_type', { length: 30 }).notNull(),
  targetUserId: uuid('target_user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  reason: text('reason').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
