'use client';

import { useQuery } from '@tanstack/react-query';
import { courseService } from './course-service';
import { queryKeys } from '../query/keys';
import { QueryCourseParams, CourseDetailResponse } from '../../types/course';
import { PaginatedResult } from '../../types/content';
import { CourseItem } from '../../types/course';

export function useCourseList(params?: QueryCourseParams) {
  return useQuery<PaginatedResult<CourseItem>>({
    queryKey: queryKeys.series.list(params as Record<string, unknown>),
    queryFn: () => courseService.getAllCourses(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCourseDetail(
  slug: string,
  params?: QueryCourseParams,
  options?: { initialData?: CourseDetailResponse }
) {
  return useQuery<CourseDetailResponse>({
    queryKey: queryKeys.series.detail(slug, params as Record<string, unknown>),
    queryFn: () => courseService.getBySlug(slug, params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    initialData: options?.initialData,
  });
}
