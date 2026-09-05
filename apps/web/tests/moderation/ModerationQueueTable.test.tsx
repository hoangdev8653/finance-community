import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModerationQueueTable } from '@/components/moderation/ModerationQueueTable';
import * as moderationHooks from '@/lib/moderation/use-moderation';

vi.mock('@/lib/moderation/use-moderation');

describe('ModerationQueueTable Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders queue items and status tabs', () => {
    const mockReports = [
      {
        id: 'report-1',
        reporterId: 'user-111',
        reportedPostId: 'post-999',
        reportedCommentId: null,
        reportedUserId: null,
        reason: 'Financial Misinformation',
        description: 'Misleading revenue claims',
        status: 'OPEN' as const,
        createdAt: '2026-08-16T00:00:00Z',
        resolvedAt: null,
      },
    ];

    vi.mocked(moderationHooks.useModerationQueue).mockReturnValue({
      data: {
        data: mockReports,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<ModerationQueueTable />);

    expect(screen.getByText('Hàng đợi Báo cáo Vi phạm')).toBeDefined();
    expect(screen.getAllByText('Financial Misinformation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('POST').length).toBeGreaterThan(0);
  });

  it('renders empty queue state when reports list is empty', () => {
    vi.mocked(moderationHooks.useModerationQueue).mockReturnValue({
      data: {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<ModerationQueueTable />);

    expect(screen.getByText('Hàng đợi đang trống')).toBeDefined();
  });
});
