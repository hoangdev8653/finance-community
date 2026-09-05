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
import { useTranslation } from '@/lib/i18n/useTranslation';

export function NotificationsCenter() {
  const { t } = useTranslation();
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
            {t('notifications.title')}
          </h1>
          <p className="text-xs text-muted-foreground font-mono pt-1">
            {t('notifications.subtitle')}
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
            <span>{t('notifications.markAllRead')}</span>
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
          {t('notifications.allNotifications')}
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
          <span>{t('notifications.unread')}</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
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
          title="Không thể tải thông báo"
          message="Không thể nhận thông báo mới. Vui lòng kiểm tra kết nối mạng."
          onRetry={() => refetch()}
        />
      ) : (
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          hasNextPage={notificationsResponse?.meta?.hasNextPage}
          onLoadMore={() => setPage((p) => p + 1)}
          emptyTitle={activeFilter === 'unread' ? t('notifications.noUnread') : t('notifications.noNotifications')}
          emptyDescription={
            activeFilter === 'unread'
              ? t('notifications.noUnreadDesc')
              : t('notifications.noNotificationsDesc')
          }
        />
      )}
    </main>
  );
}
