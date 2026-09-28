'use client';

import React from 'react';
import { NotificationEntity } from '@/types/notifications';
import { NotificationCard } from './NotificationCard';
import { NotificationSkeleton } from './NotificationSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';

interface NotificationListProps {
  notifications: NotificationEntity[];
  isLoading: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onItemClick?: () => void;
  compact?: boolean;
}

export function NotificationList({
  notifications,
  isLoading,
  hasNextPage = false,
  onLoadMore,
  emptyTitle = 'Chưa có thông báo nào',
  emptyDescription = 'Hộp thư thông báo của bạn hiện đang trống.',
  onItemClick,
  compact = false,
}: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return <NotificationSkeleton compact={compact} />;
  }

  if (notifications.length === 0) {
    if (compact) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
          <div className="relative mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/15 via-emerald-500/10 to-transparent text-primary shadow-xs ring-1 ring-primary/20">
            <Bell className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border shadow-xs text-[10px]">
              ✨
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground">
            {emptyTitle}
          </h4>
          <p className="mt-1 max-w-[260px] text-xs font-medium leading-relaxed text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      );
    }

    return (
      <EmptyState
        icon={Bell}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2.5'}>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onNavigate={onItemClick}
          compact={compact}
        />
      ))}

      {hasNextPage && onLoadMore && (
        <div className="flex justify-center pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm thông báo'}
          </Button>
        </div>
      )}
    </div>
  );
}
