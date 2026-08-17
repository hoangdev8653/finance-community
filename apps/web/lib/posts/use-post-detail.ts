'use client';

import { useQuery } from '@tanstack/react-query';
import { postsService } from './posts-service';
import { queryKeys } from '../query/keys';
import { PostDetailResponse } from '../../types/content';

export function usePostDetail(
  contentType: string,
  slug: string,
  initialData?: PostDetailResponse
) {
  const normalizedType = contentType.toUpperCase();

  return useQuery({
    queryKey: queryKeys.posts.detail(normalizedType, slug),
    queryFn: () => postsService.getBySlug(normalizedType, slug),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes detail cache
    enabled: Boolean(contentType && slug),
  });
}
