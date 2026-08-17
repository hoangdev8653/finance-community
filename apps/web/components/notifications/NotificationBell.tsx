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
import { Bell, CheckCheck } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: notificationsResponse, isLoading } = useUserNotifications({
    page: 1,
    limit: 5,
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
        label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-controls="notification-popover"
        aria-haspopup="dialog"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative"
      >
        <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-mono font-bold text-primary-foreground leading-none animate-in zoom-in"
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
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-background shadow-xl z-50 animate-in fade-in zoom-in-95 p-4 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif text-sm font-bold text-foreground">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="font-mono text-2xs h-7 px-2 gap-1 text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Mark all as read</span>
              </Button>
            )}
          </div>

          {/* Quick List */}
          <div className="max-h-80 overflow-y-auto pr-1">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onItemClick={() => setIsOpen(false)}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-3 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono text-primary hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
