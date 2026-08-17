'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from './notifications-service';
import { queryKeys } from '../query/keys';
import { QueryNotificationsParams } from '../../types/notifications';
import { useAuth } from '../auth/AuthContext';

export function useUserNotifications(params?: QueryNotificationsParams) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>),
    queryFn: () => notificationsService.getUserNotifications(params),
    staleTime: 30 * 1000, // 30s
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated,
  });
}

export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const response = await notificationsService.getUserNotifications({
        isRead: false,
        limit: 1,
      });
      return response.meta.totalItems;
    },
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
