import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LearningEditorialQueue } from '@/components/admin/LearningEditorialQueue';
import { learningAdminService } from '@/lib/learning/learning-admin-service';
import type { LearningAdminPost } from '@/types/learning-admin';

// Mock learningAdminService
vi.mock('@/lib/learning/learning-admin-service', () => ({
  learningAdminService: {
    getPosts: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

// Mock ToastContext
vi.mock('@/lib/toast/ToastContext', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  }),
}));

const mockPosts: LearningAdminPost[] = [
  {
    id: 'post-1',
    title: 'Phân tích kỹ thuật cơ bản',
    slug: 'phan-tich-ky-thuat-co-ban',
    status: 'DRAFT',
    editorialStatus: 'REVIEW',
    categoryId: 'cat-1',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-02T10:00:00.000Z',
    publishedAt: null,
  },
  {
    id: 'post-2',
    title: 'Chiến lược quản trị vốn',
    slug: 'chien-luoc-quan-tri-von',
    status: 'PUBLISHED',
    editorialStatus: 'PUBLISHED',
    categoryId: 'cat-2',
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z',
    publishedAt: '2026-02-20T10:00:00.000Z',
  },
];

describe('LearningEditorialQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders metric cards, tabs, and filters posts by status tab', async () => {
    vi.mocked(learningAdminService.getPosts).mockResolvedValue({
      data: mockPosts,
      meta: { page: 1, limit: 50, totalItems: 2, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    render(<LearningEditorialQueue />);

    // Expect loading state first
    expect(screen.getByText(/Đang đồng bộ dữ liệu/i)).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('Duyệt nội dung học tập')).toBeInTheDocument();
    });

    // Check KPI summary cards
    expect(screen.getByText('Tổng bài học')).toBeInTheDocument();
    expect(screen.getAllByText('Chờ duyệt').length).toBeGreaterThanOrEqual(1);

    // Default tab is REVIEW, so post-1 should be shown and post-2 hidden
    expect(screen.getByText('Phân tích kỹ thuật cơ bản')).toBeInTheDocument();
    expect(screen.queryByText('Chiến lược quản trị vốn')).not.toBeInTheDocument();

    // Click 'Tất cả' tab
    const allTab = screen.getByRole('button', { name: /Tất cả/i });
    fireEvent.click(allTab);

    // Now both posts should be visible
    expect(screen.getByText('Phân tích kỹ thuật cơ bản')).toBeInTheDocument();
    expect(screen.getByText('Chiến lược quản trị vốn')).toBeInTheDocument();
  });

  it('renders rich empty state when no posts match tab or search', async () => {
    vi.mocked(learningAdminService.getPosts).mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 50, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    render(<LearningEditorialQueue />);

    await waitFor(() => {
      expect(screen.getByText('Chưa có bài học ở trạng thái này')).toBeInTheDocument();
    });

    expect(screen.getByText(/Hiện tại chưa có bài học nào trong danh mục này/i)).toBeInTheDocument();
    const refreshBtns = screen.getAllByRole('button', { name: /Làm mới dữ liệu/i });
    expect(refreshBtns.length).toBeGreaterThanOrEqual(1);
  });
});
