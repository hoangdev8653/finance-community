import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsCenter } from '@/components/notifications/NotificationsCenter';
import {
  useUserNotifications,
  useUnreadNotificationsCount,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';

vi.mock('@/lib/notifications/use-notifications', () => ({
  useUserNotifications: vi.fn(),
  useUnreadNotificationsCount: vi.fn(),
  useMarkAllAsRead: vi.fn(),
  useMarkAsRead: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

describe('NotificationsCenter Component', () => {
  const markAllMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useMarkAllAsRead).mockReturnValue({
      mutateAsync: markAllMock,
      isPending: false,
    } as any);
  });

  it('renders page header, tabs, and filters notifications', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 1,
      isLoading: false,
    } as any);

    vi.mocked(useUserNotifications).mockReturnValue({
      data: {
        data: [
          {
            id: 'n-1',
            userId: 'u-1',
            type: 'NEW_FOLLOWER',
            title: 'New Analyst Follower',
            message: 'PortfolioManager started following you.',
            referencePostId: null,
            referenceCommentId: null,
            referenceUserId: null,
            isRead: false,
            readAt: null,
            createdAt: '2026-08-15T00:00:00Z',
          },
        ],
        meta: {
          hasNextPage: false,
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<NotificationsCenter />);

    expect(screen.getByRole('heading', { level: 1, name: /Trung tâm thông báo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Tất cả$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Chưa đọc/i })).toBeDefined();
    expect(screen.getByText('New Analyst Follower')).toBeDefined();

    // Switch tab to Unread
    const unreadTab = screen.getByRole('button', { name: /Chưa đọc/i });
    fireEvent.click(unreadTab);

    expect(unreadTab.className).toContain('bg-primary');
  });

  it('renders empty state when no notifications match', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 0,
      isLoading: false,
    } as any);

    vi.mocked(useUserNotifications).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    } as any);

    render(<NotificationsCenter />);

    expect(screen.getByText(/Hộp thông báo đang trống/i)).toBeDefined();
  });
});
