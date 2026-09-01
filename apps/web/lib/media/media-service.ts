import { apiClient } from '../api/client';
import {
  UploadSignatureResponse,
  RegisterMediaDto,
  MediaItem,
} from '../../types/media';

export const mediaService = {
  /**
   * Request presigned Cloudinary upload parameters
   * POST /api/v1/media/upload-signature
   */
  async getUploadSignature(
    folder = 'uploads'
  ): Promise<UploadSignatureResponse> {
    const response = await apiClient.post<UploadSignatureResponse>(
      '/media/upload-signature',
      { folder }
    );
    return response.data;
  },

  /**
   * Register uploaded media metadata with platform database
   * POST /api/v1/media
   */
  async registerMedia(dto: RegisterMediaDto): Promise<MediaItem> {
    const response = await apiClient.post<MediaItem>('/media', dto);
    return response.data;
  },

  async findByHash(contentHash: string): Promise<MediaItem | null> {
    const response = await apiClient.get<MediaItem | null>(`/media/by-hash/${encodeURIComponent(contentHash)}`);
    return response.data;
  },

  /**
   * Retrieve media asset details by ID
   * GET /api/v1/media/:id
   */
  async getMediaById(id: string): Promise<MediaItem> {
    const response = await apiClient.get<MediaItem>(
      `/media/${encodeURIComponent(id)}`
    );
    return response.data;
  },

  /**
   * Soft-delete owned media asset
   * DELETE /api/v1/media/:id (204 No Content)
   */
  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${encodeURIComponent(id)}`);
  },
};
