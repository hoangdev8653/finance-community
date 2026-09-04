'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  useUnreadNotificationsCount,
  useUserNotifications,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';
import { NotificationList } from './NotificationList';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCheck, Sparkles, ExternalLink } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: notificationsResponse, isLoading } = useUserNotifications({
    isRead: filter === 'unread' ? false : undefined,
    page: 1,
    limit: 6,
  });

  const markAllMutation = useMarkAllAsRead();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    if (!markAllMutation.isPending) {
      await markAllMutation.mutateAsync();
    }
  };

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;
  const notifications = notificationsResponse?.data || [];

  return (
    <div className="relative">
      <IconButton
        ref={triggerRef}
        variant="ghost"
        size="sm"
        label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={isOpen}
        aria-controls="notification-popover"
        aria-haspopup="dialog"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative"
      >
        <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-mono font-bold text-primary-foreground leading-none animate-in zoom-in"
          >
            {displayCount}
          </span>
        )}
      </IconButton>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="notification-popover"
          role="dialog"
          aria-label="Thông báo"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 p-4 space-y-3"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="font-mono text-xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Đã đọc tất cả</span>
              </Button>
            )}
          </div>

          {/* Quick Sub-tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`flex-1 rounded-md py-1 text-center font-mono text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`flex-1 rounded-md py-1 text-center font-mono text-xs font-semibold transition ${
                filter === 'unread'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Quick Notifications List */}
          <div className="max-h-80 overflow-y-auto pr-1">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onItemClick={() => setIsOpen(false)}
              emptyTitle={filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              emptyDescription={
                filter === 'unread'
                  ? 'Bạn đã xem hết tất cả thông báo.'
                  : 'Các hoạt động mới của bạn sẽ hiển thị ở đây.'
              }
            />
          </div>

          {/* Popover Footer */}
          <div className="border-t border-border pt-3 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Xem tất cả trong Trung tâm thông báo</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
