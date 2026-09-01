import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LearningSeriesRepository } from '../../../database/repositories/learning-series.repository';
import { AddSeriesLessonDto, CreateLearningSeriesDto, UpdateLearningSeriesDto, UpdateSeriesLessonDto, UpdateSeriesLessonOrderDto } from '../dto/create-learning-series.dto';

@Injectable()
export class LearningSeriesService {
  constructor(private readonly repo: LearningSeriesRepository) {}
  list() { return this.repo.list(); }
  listPublished() { return this.repo.listPublished(); }
  async create(userId: string, dto: CreateLearningSeriesDto) {
    try { return await this.repo.create({ ...dto, createdBy: userId }); }
    catch { throw new ConflictException('Slug Series đã tồn tại.'); }
  }
  async get(id: string) {
    const series = await this.repo.findById(id); if (!series) throw new NotFoundException('Không tìm thấy Series.');
    return { series, lessons: await this.repo.adminLessons(id) };
  }
  async getPublicPath(slug: string) {
    const series = await this.repo.findBySlug(slug);
    if (!series || !series.isPublished) throw new NotFoundException('Không tìm thấy lộ trình học.');
    return { series, lessons: await this.repo.publicLessons(series.id) };
  }
  async getPathProgress(id: string, userId: string) {
    const series = await this.repo.findById(id);
    if (!series || !series.isPublished) throw new NotFoundException('Không tìm thấy lộ trình học.');
    const rawLessons = await this.repo.lessonsWithProgress(id, userId);
    let hasPendingRequiredLesson = false;
    const lessons = rawLessons.map((lesson) => {
      const completed = Boolean(lesson.completedAt);
      const locked = hasPendingRequiredLesson;
      if (lesson.isRequired && !completed) hasPendingRequiredLesson = true;
      return { ...lesson, completed, locked };
    });
    const completedCount = lessons.filter((lesson) => lesson.completed).length;
    const requiredCount = lessons.filter((lesson) => lesson.isRequired).length;
    const requiredCompletedCount = lessons.filter((lesson) => lesson.isRequired && lesson.completed).length;
    const nextLesson = lessons.find((lesson) => !lesson.completed && !lesson.locked) ?? null;
    return { seriesId: series.id, completedCount, totalCount: lessons.length, requiredCompletedCount, requiredCount, percentage: requiredCount ? Math.round((requiredCompletedCount / requiredCount) * 100) : 0, nextLesson, lessons };
  }
  async addLesson(seriesId: string, dto: AddSeriesLessonDto) {
    if (!(await this.repo.findById(seriesId))) throw new NotFoundException('Không tìm thấy Series.');
    try { return await this.repo.addLesson({ seriesId, ...dto }); }
    catch { throw new ConflictException('Số thứ tự bài học hoặc bài viết đã tồn tại trong Series.'); }
  }
  async update(id: string, dto: UpdateLearningSeriesDto) {
    if (!(await this.repo.findById(id))) throw new NotFoundException('Không tìm thấy Series.');
    try { return await this.repo.update(id, { ...dto, status: dto.isPublished === undefined ? undefined : dto.isPublished ? 'PUBLISHED' : 'DRAFT' }); }
    catch { throw new ConflictException('Slug Series đã tồn tại.'); }
  }
  async remove(id: string) {
    if (!(await this.repo.findById(id))) throw new NotFoundException('Không tìm thấy Series.');
    await this.repo.remove(id); return { deleted: true };
  }
  async reorderLesson(seriesId: string, postId: string, dto: UpdateSeriesLessonOrderDto) {
    const lessons = await this.repo.lessons(seriesId);
    const current = lessons.find((lesson) => lesson.postId === postId);
    if (!current) throw new NotFoundException('Bài học không thuộc lộ trình này.');
    if (current.lessonOrder === dto.lessonOrder) return current;
    const target = lessons.find((lesson) => lesson.lessonOrder === dto.lessonOrder);
    await this.repo.updateLessonOrder(seriesId, postId, 0);
    if (target) await this.repo.updateLessonOrder(seriesId, target.postId, current.lessonOrder);
    return this.repo.updateLessonOrder(seriesId, postId, dto.lessonOrder);
  }
  async updateLesson(seriesId: string, postId: string, dto: UpdateSeriesLessonDto) {
    const lesson = await this.repo.updateLesson(seriesId, postId, dto.isRequired);
    if (!lesson) throw new NotFoundException('Bài học không thuộc lộ trình này.');
    return lesson;
  }
  async removeLesson(seriesId: string, postId: string) {
    const lessons = await this.repo.lessons(seriesId);
    const lesson = lessons.find((item) => item.postId === postId);
    if (!lesson) throw new NotFoundException('Bài học không thuộc lộ trình này.');
    await this.repo.removeLesson(seriesId, postId);
    const remaining = lessons.filter((item) => item.postId !== postId).sort((a, b) => a.lessonOrder - b.lessonOrder);
    for (const [index, item] of remaining.entries()) await this.repo.updateLessonOrder(seriesId, item.postId, index + 1);
    return { deleted: true };
  }
}
