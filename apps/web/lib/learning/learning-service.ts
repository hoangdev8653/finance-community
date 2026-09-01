import { apiClient } from '../api/client';

export interface LearningQuiz {
  quiz: { id: string; postId: string; title: string; description: string | null } | null;
  questions: Array<{ id: string; prompt: string; options: unknown[]; explanation: string | null; sortOrder: number }>;
}

export interface LearningProgress {
  completedAt: string | null;
  lastViewedAt: string;
}

export const learningService = {
  async getQuiz(postId: string) {
    const response = await apiClient.get<LearningQuiz>(`/learning/posts/${encodeURIComponent(postId)}/quiz`);
    return response.data;
  },
  async submitQuiz(postId: string, answers: Array<{ questionId: string; optionId: string }>) {
    const response = await apiClient.post<{ score: number; total: number; percentage: number }>(`/learning/posts/${encodeURIComponent(postId)}/quiz/submit`, { answers });
    return response.data;
  },
  async getProgress(postId: string) {
    const response = await apiClient.get<LearningProgress | null>(`/learning/posts/${encodeURIComponent(postId)}/progress`);
    return response.data;
  },
  async updateProgress(postId: string, completed: boolean) {
    const response = await apiClient.patch<LearningProgress>(`/learning/posts/${encodeURIComponent(postId)}/progress`, { completed });
    return response.data;
  },
  async getUserProgress() {
    const response = await apiClient.get<Array<LearningProgress & { postId: string; title: string; slug: string }>>('/learning/progress');
    return response.data;
  },
  async submitForReview(postId: string) {
    const response = await apiClient.patch(`/learning/posts/${encodeURIComponent(postId)}/submit-review`);
    return response.data;
  },
};
