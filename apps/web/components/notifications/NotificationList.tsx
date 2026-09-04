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
}

export function NotificationList({
  notifications,
  isLoading,
  hasNextPage = false,
  onLoadMore,
  emptyTitle = 'Chưa có thông báo nào',
  emptyDescription = 'Hộp thư thông báo của bạn hiện đang trống.',
  onItemClick,
}: NotificationListProps) {
  if (isLoading && notifications.length === 0) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onNavigate={onItemClick}
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
