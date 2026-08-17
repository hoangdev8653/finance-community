import { apiClient } from '../api/client';
import {
  SerializedComment,
  CreateCommentDto,
  UpdateCommentDto,
  QueryCommentsParams,
} from '../../types/comments';
import { PaginatedResult } from '../../types/content';

export const commentsService = {
  /**
   * Get thread comments for a post
   * GET /api/v1/posts/:postId/comments
   */
  async getPostComments(
    postId: string,
    params?: QueryCommentsParams
  ): Promise<PaginatedResult<SerializedComment>> {
    const response = await apiClient.get<PaginatedResult<SerializedComment>>(
      `/posts/${encodeURIComponent(postId)}/comments`,
      { params }
    );
    return response.data;
  },

  /**
   * Create new comment or nested reply under a post
   * POST /api/v1/posts/:postId/comments
   */
  async createComment(
    postId: string,
    dto: CreateCommentDto
  ): Promise<SerializedComment> {
    const response = await apiClient.post<SerializedComment>(
      `/posts/${encodeURIComponent(postId)}/comments`,
      dto
    );
    return response.data;
  },

  /**
   * Update existing comment text (Author only)
   * PATCH /api/v1/comments/:id
   */
  async updateComment(
    commentId: string,
    dto: UpdateCommentDto
  ): Promise<SerializedComment> {
    const response = await apiClient.patch<SerializedComment>(
      `/comments/${encodeURIComponent(commentId)}`,
      dto
    );
    return response.data;
  },

  /**
   * Soft-delete comment (Author or Moderator/Admin)
   * DELETE /api/v1/comments/:id
   */
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${encodeURIComponent(commentId)}`);
  },
};
