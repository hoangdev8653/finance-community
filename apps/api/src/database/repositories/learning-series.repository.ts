import { Injectable, Inject } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../database.constants';
import type { DrizzleDB } from '../database.module';
import { learningSeriesPostsTable, learningSeriesTable } from '../schema/learning-series.schema';
import { postsTable } from '../schema/posts.schema';
import { learningProgressTable } from '../schema/learning.schema';

@Injectable()
export class LearningSeriesRepository {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB) {}
  list() { return this.db.select().from(learningSeriesTable).orderBy(asc(learningSeriesTable.title)); }
  listPublished() { return this.db.select().from(learningSeriesTable).where(eq(learningSeriesTable.isPublished, true)).orderBy(asc(learningSeriesTable.title)); }
  async findById(id: string) { const [row] = await this.db.select().from(learningSeriesTable).where(eq(learningSeriesTable.id, id)); return row; }
  async findBySlug(slug: string) { const [row] = await this.db.select().from(learningSeriesTable).where(eq(learningSeriesTable.slug, slug)); return row; }
  async create(data: typeof learningSeriesTable.$inferInsert) { const [row] = await this.db.insert(learningSeriesTable).values(data).returning(); return row; }
  async update(id: string, data: Partial<typeof learningSeriesTable.$inferInsert>) { const [row] = await this.db.update(learningSeriesTable).set({ ...data, updatedAt: new Date() }).where(eq(learningSeriesTable.id, id)).returning(); return row; }
  async remove(id: string) { await this.db.delete(learningSeriesTable).where(eq(learningSeriesTable.id, id)); }
  async addLesson(data: typeof learningSeriesPostsTable.$inferInsert) { const [row] = await this.db.insert(learningSeriesPostsTable).values(data).returning(); return row; }
  lessons(seriesId: string) { return this.db.select().from(learningSeriesPostsTable).where(eq(learningSeriesPostsTable.seriesId, seriesId)).orderBy(asc(learningSeriesPostsTable.lessonOrder)); }
  publicLessons(seriesId: string) {
    return this.db.select({ id: postsTable.id, title: postsTable.title, slug: postsTable.slug, lessonOrder: learningSeriesPostsTable.lessonOrder, isRequired: learningSeriesPostsTable.isRequired })
      .from(learningSeriesPostsTable)
      .innerJoin(postsTable, eq(learningSeriesPostsTable.postId, postsTable.id))
      .where(and(eq(learningSeriesPostsTable.seriesId, seriesId), eq(postsTable.contentType, 'SERIES'), eq(postsTable.status, 'PUBLISHED')))
      .orderBy(asc(learningSeriesPostsTable.lessonOrder));
  }
  adminLessons(seriesId: string) {
    return this.db.select({ id: postsTable.id, title: postsTable.title, slug: postsTable.slug, lessonOrder: learningSeriesPostsTable.lessonOrder, isRequired: learningSeriesPostsTable.isRequired })
      .from(learningSeriesPostsTable).innerJoin(postsTable, eq(learningSeriesPostsTable.postId, postsTable.id))
      .where(eq(learningSeriesPostsTable.seriesId, seriesId)).orderBy(asc(learningSeriesPostsTable.lessonOrder));
  }
  lessonsWithProgress(seriesId: string, userId: string) {
    return this.db.select({ id: postsTable.id, title: postsTable.title, slug: postsTable.slug, lessonOrder: learningSeriesPostsTable.lessonOrder, isRequired: learningSeriesPostsTable.isRequired, completedAt: learningProgressTable.completedAt })
      .from(learningSeriesPostsTable).innerJoin(postsTable, eq(learningSeriesPostsTable.postId, postsTable.id))
      .leftJoin(learningProgressTable, and(eq(learningProgressTable.postId, postsTable.id), eq(learningProgressTable.userId, userId)))
      .where(and(eq(learningSeriesPostsTable.seriesId, seriesId), eq(postsTable.contentType, 'SERIES'), eq(postsTable.status, 'PUBLISHED')))
      .orderBy(asc(learningSeriesPostsTable.lessonOrder));
  }
  async updateLessonOrder(seriesId: string, postId: string, lessonOrder: number) { const [row] = await this.db.update(learningSeriesPostsTable).set({ lessonOrder }).where(and(eq(learningSeriesPostsTable.seriesId, seriesId), eq(learningSeriesPostsTable.postId, postId))).returning(); return row; }
  async updateLesson(seriesId: string, postId: string, isRequired: boolean) { const [row] = await this.db.update(learningSeriesPostsTable).set({ isRequired }).where(and(eq(learningSeriesPostsTable.seriesId, seriesId), eq(learningSeriesPostsTable.postId, postId))).returning(); return row; }
  async removeLesson(seriesId: string, postId: string) { await this.db.delete(learningSeriesPostsTable).where(and(eq(learningSeriesPostsTable.seriesId, seriesId), eq(learningSeriesPostsTable.postId, postId))); }
}
