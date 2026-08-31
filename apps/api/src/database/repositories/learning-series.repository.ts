import { Injectable, Inject } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { learningSeriesPostsTable, learningSeriesTable } from '../schema/learning-series.schema';

@Injectable()
export class LearningSeriesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}
  list() { return this.db.select().from(learningSeriesTable).orderBy(asc(learningSeriesTable.title)); }
  async findById(id: string) { const [row] = await this.db.select().from(learningSeriesTable).where(eq(learningSeriesTable.id, id)); return row; }
  async create(data: typeof learningSeriesTable.$inferInsert) { const [row] = await this.db.insert(learningSeriesTable).values(data).returning(); return row; }
  async addLesson(data: typeof learningSeriesPostsTable.$inferInsert) { const [row] = await this.db.insert(learningSeriesPostsTable).values(data).returning(); return row; }
  lessons(seriesId: string) { return this.db.select().from(learningSeriesPostsTable).where(eq(learningSeriesPostsTable.seriesId, seriesId)).orderBy(asc(learningSeriesPostsTable.lessonOrder)); }
}
