import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LearningSeriesRepository } from '../../../database/repositories/learning-series.repository';
import { AddSeriesLessonDto, CreateLearningSeriesDto } from '../dto/create-learning-series.dto';

@Injectable()
export class LearningSeriesService {
  constructor(private readonly repo: LearningSeriesRepository) {}
  list() { return this.repo.list(); }
  async create(userId: string, dto: CreateLearningSeriesDto) {
    try { return await this.repo.create({ ...dto, createdBy: userId }); }
    catch { throw new ConflictException('Slug Series đã tồn tại.'); }
  }
  async get(id: string) {
    const series = await this.repo.findById(id); if (!series) throw new NotFoundException('Không tìm thấy Series.');
    return { series, lessons: await this.repo.lessons(id) };
  }
  async addLesson(seriesId: string, dto: AddSeriesLessonDto) {
    if (!(await this.repo.findById(seriesId))) throw new NotFoundException('Không tìm thấy Series.');
    try { return await this.repo.addLesson({ seriesId, ...dto }); }
    catch { throw new ConflictException('Số thứ tự bài học hoặc bài viết đã tồn tại trong Series.'); }
  }
}
