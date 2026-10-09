import { date, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const pageViewsDailyTable = pgTable('page_views_daily', {
  day: date('day').primaryKey(),
  views: integer('views').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
