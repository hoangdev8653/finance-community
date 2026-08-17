import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useMarkAsRead } from '@/lib/notifications/use-notifications';
import { NotificationEntity } from '@/types/notifications';

vi.mock('@/lib/notifications/use-notifications', () => ({
  useMarkAsRead: vi.fn(),
}));

describe('NotificationCard Component', () => {
  const markAsReadMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useMarkAsRead).mockReturnValue({
      mutateAsync: markAsReadMock,
      isPending: false,
    } as any);
  });

  const mockNotification: NotificationEntity = {
    id: 'n-1',
    userId: 'u-1',
    type: 'COMMENT_REPLY',
    title: 'New Reply on Valuation Note',
    message: 'Great insights on the DCF assumptions!',
    referencePostId: 'p-1',
    referenceCommentId: 'c-1',
    referenceUserId: 'u-2',
    isRead: false,
    readAt: null,
    createdAt: '2026-08-15T00:00:00Z',
  };

  it('renders title, message, and formatted date', () => {
    render(<NotificationCard notification={mockNotification} />);

    expect(screen.getByText('New Reply on Valuation Note')).toBeDefined();
    expect(screen.getByText('Great insights on the DCF assumptions!')).toBeDefined();
  });

  it('handles mark-as-read button click', () => {
    render(<NotificationCard notification={mockNotification} />);

    const markBtn = screen.getByRole('button', { name: /Mark as read/i });
    fireEvent.click(markBtn);

    expect(markAsReadMock).toHaveBeenCalledWith('n-1');
  });

  it('renders read notification without mark-as-read button', () => {
    const readNotification: NotificationEntity = {
      ...mockNotification,
      isRead: true,
      readAt: '2026-08-15T01:00:00Z',
    };

    render(<NotificationCard notification={readNotification} />);

    expect(screen.queryByRole('button', { name: /Mark as read/i })).toBeNull();
  });
});
