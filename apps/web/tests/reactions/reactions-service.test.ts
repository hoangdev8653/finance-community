import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactionsService } from '@/lib/reactions/reactions-service';
import { apiClient } from '@/lib/api/client';

describe('Reactions Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPostReactions() calls GET /posts/:id/reactions', async () => {
    const mockResponse = { total: 42, userReacted: true };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await reactionsService.getPostReactions('post-123');

    expect(getSpy).toHaveBeenCalledWith('/posts/post-123/reactions');
    expect(result).toEqual(mockResponse);
  });

  it('togglePostReaction() calls POST /posts/:id/reactions with dto', async () => {
    const mockResponse = { reacted: true, reactionType: 'LIKE' };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await reactionsService.togglePostReaction('post-123', { reactionType: 'LIKE' });

    expect(postSpy).toHaveBeenCalledWith('/posts/post-123/reactions', { reactionType: 'LIKE' });
    expect(result).toEqual(mockResponse);
  });

  it('getCommentReactions() calls GET /comments/:id/reactions', async () => {
    const mockResponse = { total: 5, userReacted: false };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await reactionsService.getCommentReactions('comment-456');

    expect(getSpy).toHaveBeenCalledWith('/comments/comment-456/reactions');
    expect(result).toEqual(mockResponse);
  });

  it('toggleCommentReaction() calls POST /comments/:id/reactions with dto', async () => {
    const mockResponse = { reacted: false, reactionType: null };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await reactionsService.toggleCommentReaction('comment-456');

    expect(postSpy).toHaveBeenCalledWith('/comments/comment-456/reactions', { reactionType: 'LIKE' });
    expect(result).toEqual(mockResponse);
  });
});
