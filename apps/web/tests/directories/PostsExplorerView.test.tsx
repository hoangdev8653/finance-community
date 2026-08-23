import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostsExplorerView } from '@/components/posts/PostsExplorerView';
import { useCategories, usePostsFeed, useCategoryMap } from '@/lib/posts/use-posts-feed';
import { PostEntity, CategoryEntity } from '@/types/content';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('@/lib/posts/use-posts-feed');

describe('PostsExplorerView Component', () => {
  const mockCategories: CategoryEntity[] = [
    {
      id: 'cat-tech',
      name: 'Tech & Semiconductors',
      slug: 'tech-semi',
      description: 'Foundry margins and GPU cycles.',
      scope: 'COMMUNITY',
      icon: null,
      sortOrder: 1,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  const mockPosts: PostEntity[] = [
    {
      id: 'post-1',
      authorId: 'author-1',
      contentType: 'COMMUNITY',
      title: 'Semiconductor Foundry Free Cash Flow Forecast',
      slug: 'semi-fcf-forecast',
      body: 'Detailed model...',
      coverMediaId: null,
      categoryId: 'cat-tech',
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      viewCount: 2400,
      publishedAt: '2026-08-14T00:00:00Z',
      createdAt: '2026-08-14T00:00:00Z',
      updatedAt: '2026-08-14T00:00:00Z',
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    } as any);

    vi.mocked(useCategoryMap).mockReturnValue({
      'cat-tech': mockCategories[0],
    });

    vi.mocked(usePostsFeed).mockReturnValue({
      data: {
        pages: [
          {
            data: mockPosts,
            meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
          },
        ],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);
  });

  it('renders master research explorer title, filter header, and post cards', () => {
    render(<PostsExplorerView />);

    expect(screen.getByText(/Khám phá Bài viết & Nghiên cứu Tài chính/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tất cả nội dung' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bài phân tích' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Chuỗi bài Series' })).toBeInTheDocument();

    expect(screen.getByText('Semiconductor Foundry Free Cash Flow Forecast')).toBeInTheDocument();
  });

  it('triggers content type filter switch on segment button click', () => {
    render(<PostsExplorerView />);

    const analysesBtn = screen.getByRole('button', { name: 'Bài phân tích' });
    fireEvent.click(analysesBtn);

    expect(analysesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles category selection and reset filter action', () => {
    render(<PostsExplorerView />);

    const categorySelect = screen.getByRole('combobox', { name: /Filter by category/i });
    fireEvent.change(categorySelect, { target: { value: 'cat-tech' } });

    expect(categorySelect).toHaveValue('cat-tech');

    // Reset button appears when filters are active
    const resetBtn = screen.getByRole('button', { name: /Đặt lại/i });
    fireEvent.click(resetBtn);

    expect(categorySelect).toHaveValue('');
  });

  it('renders contextual empty state when no posts match query filters', () => {
    vi.mocked(usePostsFeed).mockReturnValueOnce({
      data: {
        pages: [
          {
            data: [],
            meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
          },
        ],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);

    render(<PostsExplorerView />);

    expect(screen.getByText('No published analyses found')).toBeInTheDocument();
  });
});
