'use client';

import { useQuery } from '@tanstack/react-query';
import { searchService } from './search-service';
import { queryKeys } from '../query/keys';
import { SearchFilterState, SearchResultItem } from '../../types/search';
import { PaginatedResult, PostEntity, TagEntity } from '../../types/content';

export function useSearchDiscovery(filters: SearchFilterState = {}) {
  return useQuery<PaginatedResult<PostEntity>>({
    queryKey: queryKeys.search.discovery(filters),
    queryFn: () => searchService.queryPosts(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCommandPaletteSearch(query: string) {
  return useQuery<SearchResultItem[]>({
    queryKey: queryKeys.search.palette(query),
    queryFn: () => searchService.searchCommandPalette(query),
    staleTime: 30 * 1000,
  });
}

export function useSearchTags(search?: string, limit = 20) {
  return useQuery<TagEntity[]>({
    queryKey: queryKeys.tags.list(search, limit),
    queryFn: () => searchService.searchTags(search, limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTagBySlug(slug: string) {
  return useQuery<TagEntity | null>({
    queryKey: queryKeys.tags.bySlug(slug),
    queryFn: async () => {
      const tags = await searchService.searchTags(slug, 20);
      const exactMatch = tags.find(
        (t) => t.slug.toLowerCase() === slug.toLowerCase() || t.name.toLowerCase() === slug.toLowerCase()
      );
      return exactMatch || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
