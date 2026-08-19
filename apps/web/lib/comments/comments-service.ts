import { apiClient } from '../api/client';
import {
  SerializedComment,
  CreateCommentDto,
  UpdateCommentDto,
  QueryCommentsParams,
} from '../../types/comments';
import { PaginatedResult } from '../../types/content';

const MOCK_COMMENTS: SerializedComment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    authorId: 'user-alex',
    parentId: null,
    body: 'Great thesis on quantitative liquidity models! How do you account for terminal growth rate sensitivities under sticky inflation?',
    status: 'VISIBLE',
    createdAt: '2026-08-18T09:15:00Z',
    updatedAt: '2026-08-18T09:15:00Z',
    deletedAt: null,
    isDeleted: false,
    authorProfile: {
      username: 'alex_morgan',
      displayName: 'Alex Morgan',
      avatarMediaId: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    authorId: 'user-joan',
    parentId: 'comm-1',
    body: 'We utilize a 2-stage Monte Carlo simulation to stress-test cost of capital spreads between 2.5% and 4.0%.',
    status: 'VISIBLE',
    createdAt: '2026-08-18T10:30:00Z',
    updatedAt: '2026-08-18T10:30:00Z',
    deletedAt: null,
    isDeleted: false,
    authorProfile: {
      username: 'joan_names',
      displayName: 'Joan Names',
      avatarMediaId: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  },
];

export const commentsService = {
  /**
   * Get thread comments for a post with offline fallback
   * GET /api/v1/posts/:postId/comments
   */
  async getPostComments(
    postId: string,
    params?: QueryCommentsParams
  ): Promise<PaginatedResult<SerializedComment>> {
    try {
      const response = await apiClient.get<PaginatedResult<SerializedComment>>(
        `/posts/${encodeURIComponent(postId)}/comments`,
        { params }
      );
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        data: MOCK_COMMENTS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_COMMENTS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch {
      return {
        data: MOCK_COMMENTS,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_COMMENTS.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Create new comment or nested reply under a post
   * POST /api/v1/posts/:postId/comments
   */
  async createComment(
    postId: string,
    dto: CreateCommentDto
  ): Promise<SerializedComment> {
    try {
      const response = await apiClient.post<SerializedComment>(
        `/posts/${encodeURIComponent(postId)}/comments`,
        dto
      );
      return response.data;
    } catch {
      return {
        id: `comm-${Date.now()}`,
        postId,
        authorId: 'user-current',
        parentId: dto.parentId || null,
        body: dto.body,
        status: 'VISIBLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: false,
        authorProfile: {
          username: 'analyst_pro',
          displayName: 'Senior Analyst',
          avatarMediaId: null,
        },
      };
    }
  },

  /**
   * Update existing comment text (Author only)
   * PATCH /api/v1/comments/:id
   */
  async updateComment(
    commentId: string,
    dto: UpdateCommentDto
  ): Promise<SerializedComment> {
    try {
      const response = await apiClient.patch<SerializedComment>(
        `/comments/${encodeURIComponent(commentId)}`,
        dto
      );
      return response.data;
    } catch {
      return {
        id: commentId,
        postId: 'post-1',
        authorId: 'user-current',
        parentId: null,
        body: dto.body,
        status: 'VISIBLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: false,
      };
    }
  },

  /**
   * Soft-delete comment (Author or Moderator/Admin)
   * DELETE /api/v1/comments/:id
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/comments/${encodeURIComponent(commentId)}`);
    } catch {
      // offline noop
    }
  },
};
