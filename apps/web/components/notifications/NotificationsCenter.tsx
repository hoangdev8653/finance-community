'use client';

import React, { useState } from 'react';
import {
  useUserNotifications,
  useUnreadNotificationsCount,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';
import { NotificationList } from './NotificationList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Bell, CheckCheck } from 'lucide-react';

export function NotificationsCenter() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const {
    data: notificationsResponse,
    isLoading,
    isError,
    refetch,
  } = useUserNotifications({
    isRead: activeFilter === 'unread' ? false : undefined,
    page,
    limit: 20,
  });

  const markAllMutation = useMarkAllAsRead();

  const handleFilterChange = (filter: 'all' | 'unread') => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleMarkAllRead = async () => {
    if (!markAllMutation.isPending) {
      await markAllMutation.mutateAsync();
    }
  };

  const notifications = notificationsResponse?.data || [];

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-muted-foreground font-mono pt-1">
            Stay updated on research engagements, replies, and community activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            isLoading={markAllMutation.isPending}
            className="font-mono text-xs gap-1.5 shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-border pb-2" role="tablist">
        <button
          role="tab"
          aria-selected={activeFilter === 'all'}
          onClick={() => handleFilterChange('all')}
          className={`px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All Notifications
        </button>

        <button
          role="tab"
          aria-selected={activeFilter === 'unread'}
          onClick={() => handleFilterChange('unread')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-colors ${
            activeFilter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-xs ${
                activeFilter === 'unread'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Unable to load notifications"
          message="Failed to retrieve notification updates. Please check your connection."
          onRetry={() => refetch()}
        />
      ) : (
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          hasNextPage={notificationsResponse?.meta?.hasNextPage}
          onLoadMore={() => setPage((p) => p + 1)}
          emptyTitle={activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          emptyDescription={
            activeFilter === 'unread'
              ? 'You are all caught up! No unread activity.'
              : 'You do not have any notification records yet.'
          }
        />
      )}
    </main>
  );
}
