'use client';

import { useQuery } from '@tanstack/react-query';
import { seriesService } from './series-service';
import { queryKeys } from '../query/keys';
import { QuerySeriesParams, SeriesDetailResponse } from '../../types/series';
import { PaginatedResult } from '../../types/content';
import { SeriesItem } from '../../types/series';

export function useSeriesList(params?: QuerySeriesParams) {
  return useQuery<PaginatedResult<SeriesItem>>({
    queryKey: queryKeys.series.list(params as Record<string, unknown>),
    queryFn: () => seriesService.getAllSeries(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useSeriesDetail(
  slug: string,
  params?: QuerySeriesParams,
  options?: { initialData?: SeriesDetailResponse }
) {
  return useQuery<SeriesDetailResponse>({
    queryKey: queryKeys.series.detail(slug, params as Record<string, unknown>),
    queryFn: () => seriesService.getBySlug(slug, params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    initialData: options?.initialData,
  });
}
