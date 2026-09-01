import { apiClient } from '@/lib/api/client';
import type { LearningPathDetail, LearningPathProgress, LearningSeries } from '@/types/learning-series';
export const learningSeriesService = {
  async list(): Promise<LearningSeries[]> { return (await apiClient.get<LearningSeries[]>('/series/learning')).data; },
  async listPaths(): Promise<LearningSeries[]> { return (await apiClient.get<LearningSeries[]>('/series/learning/paths')).data; },
  async createPath(payload: { title: string; slug: string; description?: string; domainId: string; categoryId: string }): Promise<LearningSeries> { return (await apiClient.post<LearningSeries>('/series/learning', payload)).data; },
  async addLesson(seriesId: string, postId: string, lessonOrder: number) { return (await apiClient.post(`/series/learning/${seriesId}/lessons`, { postId, lessonOrder })).data; },
  async getPath(slug: string): Promise<LearningPathDetail> { return (await apiClient.get<LearningPathDetail>(`/series/learning/paths/${encodeURIComponent(slug)}`)).data; },
  async getAdminPath(id: string): Promise<LearningPathDetail> { return (await apiClient.get<LearningPathDetail>(`/series/learning/${encodeURIComponent(id)}`)).data; },
  async updatePath(id: string, payload: Partial<{ title: string; slug: string; description: string; domainId: string; categoryId: string; isPublished: boolean }>): Promise<LearningSeries> { return (await apiClient.patch<LearningSeries>(`/series/learning/${encodeURIComponent(id)}`, payload)).data; },
  async deletePath(id: string): Promise<void> { await apiClient.delete(`/series/learning/${encodeURIComponent(id)}`); },
  async reorderLesson(seriesId: string, postId: string, lessonOrder: number): Promise<void> { await apiClient.patch(`/series/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}/order`, { lessonOrder }); },
  async updateLesson(seriesId: string, postId: string, isRequired: boolean): Promise<void> { await apiClient.patch(`/series/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}`, { isRequired }); },
  async removeLesson(seriesId: string, postId: string): Promise<void> { await apiClient.delete(`/series/learning/${encodeURIComponent(seriesId)}/lessons/${encodeURIComponent(postId)}`); },
  async getPathProgress(id: string): Promise<LearningPathProgress> { return (await apiClient.get<LearningPathProgress>(`/series/learning/${encodeURIComponent(id)}/progress`)).data; },
};
