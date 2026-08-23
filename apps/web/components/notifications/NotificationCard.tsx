'use client';

import React from 'react';
import Link from 'next/link';
import { NotificationEntity } from '@/types/notifications';
import { useMarkAsRead } from '@/lib/notifications/use-notifications';
import {
  Bell,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Check,
} from 'lucide-react';

interface NotificationCardProps {
  notification: NotificationEntity;
  onNavigate?: () => void;
}

export function NotificationCard({
  notification,
  onNavigate,
}: NotificationCardProps) {
  const markAsReadMutation = useMarkAsRead();

  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_FOLLOWER':
        return <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />;
      case 'COMMENT_REPLY':
      case 'NEW_COMMENT':
        return <MessageSquare className="h-4 w-4 text-accent" aria-hidden="true" />;
      case 'POST_REACTION':
        return <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead && !markAsReadMutation.isPending) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
  };

  // Determine navigation target
  let href: string | null = null;
  if (notification.referencePostId) {
    href = `/?postId=${encodeURIComponent(notification.referencePostId)}`;
  } else if (notification.referenceUserId) {
    href = `/?userId=${encodeURIComponent(notification.referenceUserId)}`;
  }

  const content = (
    <div
      className={`flex items-start gap-3.5 p-4 rounded-lg border transition-colors ${
        notification.isRead
          ? 'border-border bg-surface text-foreground/80'
          : 'border-primary/30 bg-primary/5 text-foreground shadow-2xs'
      }`}
    >
      <div className="p-2 rounded-full bg-muted shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {notification.title}
          </p>

          {!notification.isRead && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              disabled={markAsReadMutation.isPending}
              aria-label="Mark as read"
              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary shrink-0"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {notification.message && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        )}

        <p className="text-xs text-muted-foreground font-mono pt-1">
          {formattedDate}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}
