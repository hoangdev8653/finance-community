import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaService } from '@/lib/media/media-service';
import { apiClient } from '@/lib/api/client';

describe('Media Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getUploadSignature() calls POST /media/upload-signature with folder', async () => {
    const mockResponse = {
      timestamp: 1720000000,
      signature: 'sha256_mock_signature',
      folder: 'posts',
    };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await mediaService.getUploadSignature('posts');

    expect(postSpy).toHaveBeenCalledWith('/media/upload-signature', { folder: 'posts' });
    expect(result).toEqual(mockResponse);
  });

  it('registerMedia() calls POST /media with DTO', async () => {
    const dto = {
      cloudinaryPublicId: 'posts/sample_123',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      resourceType: 'image' as const,
      format: 'jpg',
      width: 1920,
      height: 1080,
      fileSize: 450000,
      purpose: 'cover' as const,
    };

    const mockMedia = {
      id: 'media-uuid-1',
      uploaderId: 'user-1',
      ...dto,
      createdAt: '2026-08-16T00:00:00Z',
      updatedAt: '2026-08-16T00:00:00Z',
      deletedAt: null,
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockMedia } as any);

    const result = await mediaService.registerMedia(dto);

    expect(postSpy).toHaveBeenCalledWith('/media', dto);
    expect(result).toEqual(mockMedia);
  });

  it('getMediaById() calls GET /media/:id', async () => {
    const mockMedia = {
      id: 'media-uuid-1',
      uploaderId: 'user-1',
      cloudinaryPublicId: 'posts/sample_123',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      resourceType: 'image',
      format: 'jpg',
      width: 1920,
      height: 1080,
      fileSize: 450000,
      purpose: 'cover',
      createdAt: '2026-08-16T00:00:00Z',
      updatedAt: '2026-08-16T00:00:00Z',
      deletedAt: null,
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockMedia } as any);

    const result = await mediaService.getMediaById('media-uuid-1');

    expect(getSpy).toHaveBeenCalledWith('/media/media-uuid-1');
    expect(result).toEqual(mockMedia);
  });

  it('deleteMedia() calls DELETE /media/:id', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({} as any);

    await mediaService.deleteMedia('media-uuid-1');

    expect(deleteSpy).toHaveBeenCalledWith('/media/media-uuid-1');
  });
});
