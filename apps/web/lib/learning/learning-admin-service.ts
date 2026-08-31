import { apiClient } from '../api/client';
import { EditorialStatus, LearningQueueResponse } from '@/types/learning-admin';

export const learningAdminService = {
  async getPosts(editorialStatus?: EditorialStatus) {
    const response = await apiClient.get<LearningQueueResponse>('/learning/admin/posts', { params: { editorialStatus, page: 1, limit: 50 } });
    return response.data;
  },
  async updateStatus(postId: string, editorialStatus: EditorialStatus) {
    const response = await apiClient.patch(`/learning/admin/posts/${encodeURIComponent(postId)}/editorial-status`, { editorialStatus });
    return response.data;
  },
};
