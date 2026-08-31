import { apiClient } from '@/lib/api/client';
import type { LearningSeries } from '@/types/learning-series';
export const learningSeriesService = {
  async list(): Promise<LearningSeries[]> { return (await apiClient.get<LearningSeries[]>('/series/learning')).data; },
  async addLesson(seriesId: string, postId: string, lessonOrder: number) { return (await apiClient.post(`/series/learning/${seriesId}/lessons`, { postId, lessonOrder })).data; },
};
