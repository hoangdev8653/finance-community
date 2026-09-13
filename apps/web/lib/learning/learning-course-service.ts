import { apiClient } from '@/lib/api/client';
import type { LearningPathDetail, LearningPathProgress, LearningCourse } from '@/types/learning-course';
export const learningCourseService = {
  async list(): Promise<LearningCourse[]> { return (await apiClient.get<LearningCourse[]>('/khoa-hoc/learning')).data; },
  async listPaths(): Promise<LearningCourse[]> { return (await apiClient.get<LearningCourse[]>('/khoa-hoc/learning/paths')).data; },
  async createPath(payload: { title: string; slug: string; description?: string; domainId: string; categoryId: string; estimatedDurationMinutes?: number; learningOutcomes?: string[]; heroMediaId?: string; heroAltText?: string; outcomesMediaId?: string; outcomesAltText?: string; ctaMediaId?: string; ctaAltText?: string }): Promise<LearningCourse> { return (await apiClient.post<LearningCourse>('/khoa-hoc/learning', payload)).data; },
  async addLesson(seriesId: string, postId: string, lessonOrder: number) { return (await apiClient.post(`/khoa-hoc/learning/${seriesId}/lessons`, { postId, lessonOrder })).data; },
  async getPath(slug: string): Promise<LearningPathDetail> { return (await apiClient.get<LearningPathDetail>(`/khoa-hoc/learning/paths/${encodeURIComponent(slug)}`)).data; },
  async getAdminPath(id: string): Promise<LearningPathDetail> { return (await apiClient.get<LearningPathDetail>(`/khoa-hoc/learning/${encodeURIComponent(id)}`)).data; },
  async updatePath(id: string, payload: Partial<{ title: string; slug: string; description: string; domainId: string; categoryId: string; estimatedDurationMinutes: number; learningOutcomes: string[]; heroMediaId: string | null; heroAltText: string | null; outcomesMediaId: string | null; outcomesAltText: string | null; ctaMediaId: string | null; ctaAltText: string | null; isPublished: boolean }>): Promise<LearningCourse> { return (await apiClient.patch<LearningCourse>(`/khoa-hoc/learning/${encodeURIComponent(id)}`, payload)).data; },
  async deletePath(id: string): Promise<void> { await apiClient.delete(`/khoa-hoc/learning/${encodeURIComponent(id)}`); },
  async reorderLesson(seriesId: string, postId: string, lessonOrder: number): Promise<void> { await apiClient.patch(`/khoa-hoc/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}/order`, { lessonOrder }); },
  async updateLesson(seriesId: string, postId: string, isRequired: boolean): Promise<void> { await apiClient.patch(`/khoa-hoc/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}`, { isRequired }); },
  async removeLesson(seriesId: string, postId: string): Promise<void> { await apiClient.delete(`/khoa-hoc/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}`); },
  async getPathProgress(id: string): Promise<LearningPathProgress> { return (await apiClient.get<LearningPathProgress>(`/khoa-hoc/learning/${encodeURIComponent(id)}/progress`)).data; },
};
