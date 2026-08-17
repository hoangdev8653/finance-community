'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moderationService } from './moderation-service';
import { queryKeys } from '../query/keys';
import {
  CreateReportDto,
  ReportItem,
  QueryReportsParams,
  PaginatedReportsResponse,
  ExecuteModerationActionDto,
  ModerationActionItem,
} from '../../types/moderation';

export function useFileReport() {
  const queryClient = useQueryClient();

  return useMutation<{ report: ReportItem; isDuplicate?: boolean }, Error, CreateReportDto>({
    mutationFn: (dto: CreateReportDto) => moderationService.fileReport(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useModerationQueue(params?: QueryReportsParams) {
  return useQuery<PaginatedReportsResponse>({
    queryKey: queryKeys.reports.queue(params),
    queryFn: () => moderationService.getModerationQueue(params),
    staleTime: 30 * 1000, // 30 seconds fresh
  });
}

export function useExecuteModerationAction() {
  const queryClient = useQueryClient();

  return useMutation<ModerationActionItem, Error, ExecuteModerationActionDto>({
    mutationFn: (dto: ExecuteModerationActionDto) => moderationService.executeAction(dto),
    onSuccess: (_data, variables) => {
      // 1. Invalidate moderation queue
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.all });

      // 2. Invalidate affected post queries if post target was modified
      if (variables.targetPostId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      }

      // 3. Invalidate comment or user queries if relevant
      if (variables.targetCommentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      }

      if (variables.targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
      }
    },
  });
}
