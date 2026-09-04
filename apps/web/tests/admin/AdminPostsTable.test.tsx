import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import * as usePostModeration from '@/lib/moderation/use-post-moderation';
import * as usePostMutations from '@/lib/posts/use-post-mutations';

vi.mock('@/lib/moderation/use-post-moderation');
vi.mock('@/lib/posts/use-post-mutations');
vi.mock('@/lib/toast/ToastContext', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), error: vi.fn() },
  }),
}));

const mockPosts = [
  {
    id: 'post-1',
    title: 'Phân tích cổ phiếu FPT quý 3',
    slug: 'phan-tich-co-phieu-fpt-q3',
    body: 'Nội dung chi tiết về định giá FPT...',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    moderationStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorId: 'user-1',
    author: { username: 'hoang_analyst' },
    coverMedia: null,
  },
  {
    id: 'post-2',
    title: 'Cảnh báo lừa đảo đầu tư Forex',
    slug: 'canh-bao-lua-dao-forex',
    body: 'Các sàn giao dịch không phép...',
    contentType: 'SERIES',
    status: 'HIDDEN',
    moderationStatus: 'BANNED',
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    authorId: 'user-2',
    author: { username: 'mod_security' },
    coverMedia: null,
  },
];

describe('AdminPostsTable Component', () => {
  beforeEach(() => {
    vi.mocked(usePostModeration.useModerationPosts).mockReturnValue({
      data: {
        data: mockPosts,
        meta: {
          page: 1,
          limit: 20,
          totalItems: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(usePostMutations.useDeletePostFromAdmin).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePostMutations.useUpdatePost).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePostModeration.useApprovePost).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePostModeration.useBanPost).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders post title, author, and action buttons', () => {
    render(<AdminPostsTable />);

    expect(screen.getByText('Phân tích cổ phiếu FPT quý 3')).toBeDefined();
    expect(screen.getByText('hoang_analyst')).toBeDefined();
    expect(screen.getByText('Cảnh báo lừa đảo đầu tư Forex')).toBeDefined();
    expect(screen.getByText('mod_security')).toBeDefined();
  });

  it('opens view modal when View button is clicked', () => {
    render(<AdminPostsTable />);

    const viewButtons = screen.getAllByTitle('Xem chi tiết');
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('Xem chi tiết bài viết')).toBeDefined();
    expect(screen.getByText('Nội dung chi tiết về định giá FPT...')).toBeDefined();
  });

  it('distinguishes moderation hide from soft delete', () => {
    render(<AdminPostsTable />);

    // Click Hide button on post-1
    const hideButtons = screen.getAllByTitle('Tạm ẩn bài viết');
    fireEvent.click(hideButtons[0]);

    expect(screen.getByText('Tạm ẩn bài viết (Kiểm duyệt)')).toBeDefined();
    expect(screen.getByText(/Bạn đang thực hiện/i)).toBeDefined();

    // Close modal
    fireEvent.click(screen.getByLabelText('Đóng'));

    // Click Delete button on post-1
    const deleteButtons = screen.getAllByTitle('Xóa mềm bài viết');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole('heading', { name: 'Xóa mềm bài viết' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Xóa bài viết' })).toBeDefined();
  });
});
