import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, primaryKey, unique } from 'drizzle-orm/pg-core';
import { postsTable } from './posts.schema';
import { usersTable } from './users.schema';

export const quizzesTable = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [unique('uq_quizzes_post_id').on(table.postId)]);

export const quizQuestionsTable = pgTable('quiz_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').notNull().references(() => quizzesTable.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  options: jsonb('options').$type<unknown[]>().notNull().default([]),
  explanation: text('explanation'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const learningProgressTable = pgTable('learning_progress', {
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.postId], name: 'pk_learning_progress' })]);
