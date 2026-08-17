import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postsService } from '@/lib/posts/posts-service';
import { apiClient } from '@/lib/api/client';
import { CreatePostDto, UpdatePostDto } from '@/types/content';

describe('Posts Mutations Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createPost() calls POST /posts with CreatePostDto', async () => {
    const mockDto: CreatePostDto = {
      title: 'Q3 Sovereign Debt Dynamics',
      contentType: 'COMMUNITY',
      body: 'Analytical macro overview.',
      status: 'PUBLISHED',
      tags: ['macro', 'rates'],
    };

    const mockCreatedPost = {
      id: 'p-1',
      authorId: 'u-1',
      title: 'Q3 Sovereign Debt Dynamics',
      slug: 'q3-sovereign-debt-dynamics',
      contentType: 'COMMUNITY',
      body: 'Analytical macro overview.',
      coverMediaId: null,
      categoryId: null,
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      viewCount: 0,
      publishedAt: '2026-08-15T00:00:00Z',
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      deletedAt: null,
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockCreatedPost } as any);

    const result = await postsService.createPost(mockDto);

    expect(postSpy).toHaveBeenCalledWith('/posts', mockDto);
    expect(result).toEqual(mockCreatedPost);
  });

  it('updatePost() calls PATCH /posts/:id with UpdatePostDto', async () => {
    const mockDto: UpdatePostDto = {
      title: 'Updated Sovereign Debt Dynamics',
      status: 'PUBLISHED',
    };

    const mockUpdatedPost = {
      id: 'p-1',
      authorId: 'u-1',
      title: 'Updated Sovereign Debt Dynamics',
      slug: 'q3-sovereign-debt-dynamics',
      contentType: 'COMMUNITY',
      body: 'Analytical macro overview.',
      coverMediaId: null,
      categoryId: null,
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      viewCount: 0,
      publishedAt: '2026-08-15T00:00:00Z',
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      deletedAt: null,
    };

    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockUpdatedPost } as any);

    const result = await postsService.updatePost('p-1', mockDto);

    expect(patchSpy).toHaveBeenCalledWith('/posts/p-1', mockDto);
    expect(result).toEqual(mockUpdatedPost);
  });

  it('deletePost() calls DELETE /posts/:id', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: undefined } as any);

    await postsService.deletePost('p-1');

    expect(deleteSpy).toHaveBeenCalledWith('/posts/p-1');
  });
});
