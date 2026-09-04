import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  useUnreadNotificationsCount,
  useUserNotifications,
  useMarkAllAsRead,
} from '@/lib/notifications/use-notifications';

vi.mock('@/lib/notifications/use-notifications', () => ({
  useUnreadNotificationsCount: vi.fn(),
  useUserNotifications: vi.fn(),
  useMarkAllAsRead: vi.fn(),
  useMarkAsRead: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

describe('NotificationBell Component', () => {
  const markAllMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useMarkAllAsRead).mockReturnValue({
      mutateAsync: markAllMock,
      isPending: false,
    } as any);
  });

  it('renders unread badge with exact count and 99+ cap', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 5,
      isLoading: false,
    } as any);
    vi.mocked(useUserNotifications).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as any);

    const { rerender } = render(<NotificationBell />);
    expect(screen.getByTestId('unread-badge').textContent).toBe('5');

    // Test 99+ cap
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 120,
      isLoading: false,
    } as any);

    rerender(<NotificationBell />);
    expect(screen.getByTestId('unread-badge').textContent).toBe('99+');
  });

  it('opens popover dialog on click and closes on Escape key', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 2,
      isLoading: false,
    } as any);
    vi.mocked(useUserNotifications).mockReturnValue({
      data: {
        data: [
          {
            id: 'n-1',
            userId: 'u-1',
            type: 'NEW_FOLLOWER',
            title: 'New Follower',
            message: 'Analyst followed you.',
            referencePostId: null,
            referenceCommentId: null,
            referenceUserId: null,
            isRead: false,
            readAt: null,
            createdAt: '2026-08-15T00:00:00Z',
          },
        ],
      },
      isLoading: false,
    } as any);

    render(<NotificationBell />);

    const triggerBtn = screen.getByRole('button', { name: /Thông báo/i });
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click to open
    fireEvent.click(triggerBtn);
    expect(screen.getByRole('dialog', { name: /Thông báo/i })).toBeDefined();
    expect(screen.getByText('New Follower')).toBeDefined();

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('handles "Mark all as read" click in popover', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue({
      data: 2,
      isLoading: false,
    } as any);
    vi.mocked(useUserNotifications).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as any);

    render(<NotificationBell />);

    const triggerBtn = screen.getByRole('button', { name: /Thông báo/i });
    fireEvent.click(triggerBtn);

    const markAllBtn = screen.getByRole('button', { name: /Đã đọc tất cả/i });
    fireEvent.click(markAllBtn);

    expect(markAllMock).toHaveBeenCalled();
  });
});
