'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  useUnreadNotificationsCount,
  useUserNotifications,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';
import { NotificationList } from './NotificationList';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';

interface NotificationBellProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationBell({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: NotificationBellProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof next === 'function' ? next(isOpen) : next;
    if (isControlled) {
      controlledOnOpenChange?.(nextVal);
    } else {
      setInternalIsOpen(nextVal);
    }
  };

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
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={isOpen}
        aria-controls="notification-popover"
        aria-haspopup="dialog"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isOpen
            ? 'border-primary/30 bg-primary/10 text-primary dark:bg-primary/20'
            : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-white'
        }`}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-mono font-bold text-white shadow-xs leading-none animate-in zoom-in"
          >
            {displayCount}
          </span>
        )}
      </button>

      {/* Popover Window */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="notification-popover"
          role="dialog"
          aria-label="Thông báo"
          className="absolute right-0 mt-2.5 w-[360px] sm:w-[410px] rounded-[10px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.18),0_4px_16px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3.5 bg-slate-50/90 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-50">
                  Thông báo
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {unreadCount} mới
                  </span>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="h-7 px-2.5 gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                <span>Đã đọc tất cả</span>
              </Button>
            )}
          </div>

          {/* Quick Sub-tabs */}
          <div className="px-3.5 pt-3 pb-2 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-2 p-1 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-lg py-1.5 text-center transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-center transition-all cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-white text-slate-900 shadow-xs font-bold dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'
                }`}
              >
                <span>Chưa đọc</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Notifications List */}
          <div className="max-h-[350px] overflow-y-auto px-2 py-1 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              compact={true}
              onItemClick={() => setIsOpen(false)}
              emptyTitle={filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              emptyDescription={
                filter === 'unread'
                  ? 'Tuyệt vời! Bạn đã xem hết tất cả thông báo gần đây.'
                  : 'Các thông báo về thảo luận, bài học và chuyên gia bạn theo dõi sẽ xuất hiện tại đây.'
              }
            />
          </div>

          {/* Popover Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900 p-2.5 text-center">
            <Link
              href="/thong-bao"
              onClick={() => setIsOpen(false)}
              className="group inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all hover:bg-slate-100/90 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>Xem tất cả trong Trung tâm thông báo</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
