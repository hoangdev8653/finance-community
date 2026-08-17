import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentsService } from '@/lib/comments/comments-service';
import { apiClient } from '@/lib/api/client';

describe('Comments Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPostComments() calls GET /posts/:postId/comments with params', async () => {
    const mockResponse = {
      data: [
        {
          id: 'c-1',
          postId: 'post-1',
          authorId: 'user-1',
          parentId: null,
          body: 'Great valuation methodology.',
          status: 'VISIBLE' as const,
          createdAt: '2026-08-15T12:00:00Z',
          updatedAt: '2026-08-15T12:00:00Z',
          deletedAt: null,
          isDeleted: false,
          authorProfile: {
            username: 'quant_trader',
            displayName: 'Quantitative Analyst',
            avatarMediaId: null,
          },
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await commentsService.getPostComments('post-1', { page: 1, limit: 20 });

    expect(getSpy).toHaveBeenCalledWith('/posts/post-1/comments', {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual(mockResponse);
  });

  it('createComment() calls POST /posts/:postId/comments with body and parentId', async () => {
    const mockCreated = {
      id: 'c-2',
      postId: 'post-1',
      authorId: 'user-1',
      parentId: 'c-1',
      body: 'I agree with the margin of safety.',
      status: 'VISIBLE' as const,
      createdAt: '2026-08-15T12:10:00Z',
      updatedAt: '2026-08-15T12:10:00Z',
      deletedAt: null,
      isDeleted: false,
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockCreated } as any);

    const result = await commentsService.createComment('post-1', {
      body: 'I agree with the margin of safety.',
      parentId: 'c-1',
    });

    expect(postSpy).toHaveBeenCalledWith('/posts/post-1/comments', {
      body: 'I agree with the margin of safety.',
      parentId: 'c-1',
    });
    expect(result).toEqual(mockCreated);
  });

  it('updateComment() calls PATCH /comments/:id with body', async () => {
    const mockUpdated = {
      id: 'c-1',
      postId: 'post-1',
      authorId: 'user-1',
      parentId: null,
      body: 'Updated comment text.',
      status: 'VISIBLE' as const,
      createdAt: '2026-08-15T12:00:00Z',
      updatedAt: '2026-08-15T12:30:00Z',
      deletedAt: null,
      isDeleted: false,
    };

    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockUpdated } as any);

    const result = await commentsService.updateComment('c-1', {
      body: 'Updated comment text.',
    });

    expect(patchSpy).toHaveBeenCalledWith('/comments/c-1', {
      body: 'Updated comment text.',
    });
    expect(result).toEqual(mockUpdated);
  });

  it('deleteComment() calls DELETE /comments/:id', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({} as any);

    await commentsService.deleteComment('c-1');

    expect(deleteSpy).toHaveBeenCalledWith('/comments/c-1');
  });
});
