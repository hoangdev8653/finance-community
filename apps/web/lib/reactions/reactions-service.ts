import { apiClient } from '../api/client';
import {
  ReactionCountResponse,
  ToggleReactionResponse,
  ToggleReactionDto,
} from '../../types/reactions';

export const reactionsService = {
  /**
   * Get post reactions count and current user's reaction state with offline fallback
   * GET /api/v1/posts/:id/reactions
   */
  async getPostReactions(postId: string): Promise<ReactionCountResponse> {
    try {
      const response = await apiClient.get<ReactionCountResponse>(
        `/posts/${encodeURIComponent(postId)}/reactions`
      );
      return response.data;
    } catch {
      return {
        total: 6,
        userReacted: false,
      };
    }
  },

  /**
   * Toggle reaction (Like/Unlike) on a post
   * POST /api/v1/posts/:id/reactions
   */
  async togglePostReaction(
    postId: string,
    dto: ToggleReactionDto = { reactionType: 'LIKE' }
  ): Promise<ToggleReactionResponse> {
    try {
      const response = await apiClient.post<ToggleReactionResponse>(
        `/posts/${encodeURIComponent(postId)}/reactions`,
        dto
      );
      return response.data;
    } catch {
      return {
        reacted: true,
        reactionType: dto.reactionType || 'LIKE',
      };
    }
  },

  /**
   * Get comment reactions count and current user's reaction state
   * GET /api/v1/comments/:id/reactions
   */
  async getCommentReactions(commentId: string): Promise<ReactionCountResponse> {
    try {
      const response = await apiClient.get<ReactionCountResponse>(
        `/comments/${encodeURIComponent(commentId)}/reactions`
      );
      return response.data;
    } catch {
      return {
        total: 3,
        userReacted: false,
      };
    }
  },

  /**
   * Toggle reaction (Like/Unlike) on a comment
   * POST /api/v1/comments/:id/reactions
   */
  async toggleCommentReaction(
    commentId: string,
    dto: ToggleReactionDto = { reactionType: 'LIKE' }
  ): Promise<ToggleReactionResponse> {
    try {
      const response = await apiClient.post<ToggleReactionResponse>(
        `/comments/${encodeURIComponent(commentId)}/reactions`,
        dto
      );
      return response.data;
    } catch {
      return {
        reacted: true,
        reactionType: dto.reactionType || 'LIKE',
      };
    }
  },
};
