'use client';

import React from 'react';
import Link from 'next/link';
import { NotificationEntity } from '@/types/notifications';
import { useMarkAsRead } from '@/lib/notifications/use-notifications';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  Bell,
  UserPlus,
  MessageSquare,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
  Circle,
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

  const getTypeMeta = () => {
    switch (notification.type) {
      case 'NEW_FOLLOWER':
        return {
          icon: <UserPlus className="h-4 w-4 text-purple-500" />,
          bg: 'bg-purple-500/10',
          badge: 'Theo dõi',
          badgeColor: 'text-purple-600 bg-purple-500/10',
        };
      case 'COMMENT_REPLY':
      case 'NEW_COMMENT':
        return {
          icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
          bg: 'bg-blue-500/10',
          badge: 'Bình luận',
          badgeColor: 'text-blue-600 bg-blue-500/10',
        };
      case 'POST_REACTION':
        return {
          icon: <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />,
          bg: 'bg-rose-500/10',
          badge: 'Tương tác',
          badgeColor: 'text-rose-600 bg-rose-500/10',
        };
      case 'POST_APPROVED':
        return {
          icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
          bg: 'bg-emerald-500/10',
          badge: 'Đã duyệt',
          badgeColor: 'text-emerald-600 bg-emerald-500/10',
        };
      case 'POST_BANNED':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
          bg: 'bg-destructive/10',
          badge: 'Cảnh báo',
          badgeColor: 'text-destructive bg-destructive/10',
        };
      default:
        return {
          icon: <Info className="h-4 w-4 text-primary" />,
          bg: 'bg-primary/10',
          badge: 'Hệ thống',
          badgeColor: 'text-primary bg-primary/10',
        };
    }
  };

  const meta = getTypeMeta();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!notification.isRead && !markAsReadMutation.isPending) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
  };

  const handleClick = () => {
    if (!notification.isRead && !markAsReadMutation.isPending) {
      markAsReadMutation.mutate(notification.id);
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  // Determine navigation target
  let href: string | null = null;
  if (notification.referencePostId) {
    href = `/posts/community?id=${encodeURIComponent(notification.referencePostId)}`;
  } else if (notification.referenceUserId) {
    href = `/profile/${encodeURIComponent(notification.referenceUserId)}`;
  }

  const cardContent = (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
        notification.isRead
          ? 'border-border bg-card text-foreground/85 hover:border-border/80 hover:bg-muted/30'
          : 'border-primary/30 bg-primary/5 text-foreground shadow-xs hover:border-primary/50 hover:bg-primary/10'
      }`}
    >
      {/* Type Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} mt-0.5`}>
        {meta.icon}
      </div>

      {/* Main Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${meta.badgeColor}`}>
              {meta.badge}
            </span>
            <span className="font-semibold text-sm text-foreground leading-snug">
              {notification.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" title="Chưa đọc" />
            )}
            {!notification.isRead && (
              <button
                type="button"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
                aria-label="Đánh dấu đã đọc"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-primary transition"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {notification.message && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>
        )}

        <div className="flex items-center gap-2 pt-0.5 font-mono text-[11px] text-muted-foreground">
          <span>{formatRelativeTime(notification.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}
