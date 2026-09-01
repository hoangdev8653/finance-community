'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadClient, compressImage, sha256File } from './upload-client';
import { queryKeys } from '../query/keys';
import { MediaItem } from '../../types/media';
import { mediaService } from './media-service';

export function useMediaDetail(id: string | null | undefined) {
  return useQuery<MediaItem>({
    queryKey: queryKeys.media.detail(id || ''),
    queryFn: () => mediaService.getMediaById(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export interface UploadMediaParams {
  file: File;
  purpose?: 'avatar' | 'cover' | 'content';
  folder?: string;
  onProgress?: (progress: number) => void;
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mutation = useMutation<MediaItem, Error, UploadMediaParams>({
    mutationFn: async ({ file, purpose = 'content', folder, onProgress }) => {
      setUploadProgress(0);
      const optimizedFile = await compressImage(file);
      const contentHash = await sha256File(optimizedFile);
      const existing = await mediaService.findByHash(contentHash);
      if (existing) return existing;

      // 1. Determine folder based on purpose if not explicitly provided
      const targetFolder = folder || (purpose === 'avatar' ? 'avatars' : 'posts');

      // 2. Request presigned upload signature
      const signatureData = await mediaService.getUploadSignature(targetFolder);

      // 3. Upload directly to Cloudinary
      const cloudinaryResult = await uploadClient.uploadToCloudinary(
        optimizedFile,
        signatureData,
        (percent) => {
          setUploadProgress(percent);
          onProgress?.(percent);
        }
      );

      // 4. Register metadata with platform backend
      const mediaRecord = await mediaService.registerMedia({
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        resourceType: (cloudinaryResult.resource_type as 'image' | 'video' | 'raw') || 'image',
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        fileSize: cloudinaryResult.bytes || optimizedFile.size,
        purpose,
        contentHash,
      });

      return mediaRecord;
    },
    onSuccess: (newMedia) => {
      queryClient.setQueryData(queryKeys.media.detail(newMedia.id), newMedia);
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.media.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}
