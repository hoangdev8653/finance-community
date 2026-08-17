'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postsService } from './posts-service';
import { queryKeys } from '../query/keys';
import { PostsFeedParams, CategoryEntity } from '../../types/content';

export function usePostsFeed(filters?: Omit<PostsFeedParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      postsService.getFeed({
        ...filters,
        page: pageParam,
        limit: filters?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes for feed freshness
  });
}

export function useCategories(scope?: 'SERIES' | 'COMMUNITY') {
  return useQuery({
    queryKey: queryKeys.categories.list(scope),
    queryFn: () => postsService.getCategories(scope),
    staleTime: 15 * 60 * 1000, // 15 minutes static taxonomy
  });
}

export function useTags(search?: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.tags.list(search, limit),
    queryFn: () => postsService.getTags(search, limit),
    staleTime: 15 * 60 * 1000,
  });
}

export function useCategoryMap(scope?: 'SERIES' | 'COMMUNITY'): Record<string, CategoryEntity> {
  const { data: categories = [] } = useCategories(scope);
  return categories.reduce<Record<string, CategoryEntity>>((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});
}
