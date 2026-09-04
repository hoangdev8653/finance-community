'use client';

import React, { useState } from 'react';
import {
  useUserNotifications,
  useUnreadNotificationsCount,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';
import { NotificationCategory } from '@/types/notifications';
import { NotificationList } from './NotificationList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Heart,
  ShieldAlert,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

export function NotificationsCenter() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [page, setPage] = useState(1);

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useUserNotifications({
    category: activeCategory,
    isRead: activeCategory === 'unread' ? false : undefined,
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const markAllMutation = useMarkAllAsRead();

  const handleCategoryChange = (cat: NotificationCategory) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleMarkAllRead = async () => {
    if (!markAllMutation.isPending) {
      await markAllMutation.mutateAsync();
    }
  };

  const notifications = notificationsResponse?.data || [];
  const meta = notificationsResponse?.meta;

  const categories: {
    id: NotificationCategory;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'all', label: 'Tất cả', icon: Bell },
    { id: 'unread', label: 'Chưa đọc', icon: Sparkles, badge: unreadCount },
    { id: 'comments', label: 'Bình luận', icon: MessageSquare },
    { id: 'social', label: 'Tương tác & Theo dõi', icon: Heart },
    { id: 'system', label: 'Hệ thống', icon: ShieldAlert },
  ];

  const getEmptyStateMeta = () => {
    switch (activeCategory) {
      case 'unread':
        return {
          title: 'Tuyệt vời! Bạn không có thông báo chưa đọc',
          desc: 'Tất cả các thông báo và phản hồi mới đã được bạn xem qua.',
        };
      case 'comments':
        return {
          title: 'Chưa có bình luận hoặc phản hồi mới',
          desc: 'Khi có thành viên bình luận vào bài viết hoặc trả lời bạn, thông báo sẽ xuất hiện ở đây.',
        };
      case 'social':
        return {
          title: 'Chưa có lượt tương tác hoặc người theo dõi mới',
          desc: 'Các lượt thích bài viết hoặc có người theo dõi trang cá nhân của bạn sẽ được thông báo tại đây.',
        };
      case 'system':
        return {
          title: 'Không có thông báo hệ thống',
          desc: 'Các thông báo phê duyệt nội dung hoặc cập nhật từ quản trị viên sẽ hiển thị tại đây.',
        };
      default:
        return {
          title: 'Hộp thông báo đang trống',
          desc: 'Chưa có hoạt động nào được ghi nhận cho tài khoản của bạn.',
        };
    }
  };

  const emptyMeta = getEmptyStateMeta();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Trung tâm thông báo
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cập nhật phản hồi thảo luận, hoạt động cộng đồng và thông báo kiểm duyệt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Làm mới thông báo"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllMutation.isPending}
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <CheckCheck className="h-4 w-4 text-primary" />
              <span>Đánh dấu tất cả đã đọc</span>
            </Button>
          )}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.label}</span>
              {cat.badge !== undefined && cat.badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {isError ? (
        <ErrorState
          title="Không thể tải thông báo"
          message="Đã có lỗi xảy ra trong quá trình lấy dữ liệu. Vui lòng thử lại."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            hasNextPage={meta?.hasNextPage}
            onLoadMore={() => setPage((p) => p + 1)}
            emptyTitle={emptyMeta.title}
            emptyDescription={emptyMeta.desc}
          />
        </div>
      )}
    </main>
  );
}
