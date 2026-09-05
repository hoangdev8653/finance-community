import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedList } from '@/components/content/FeedList';
import * as HookModule from '@/lib/posts/use-posts-feed';

describe('FeedList Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeletons when feed is loading', () => {
    vi.spyOn(HookModule, 'useCategoryMap').mockReturnValue({});
    vi.spyOn(HookModule, 'usePostsFeed').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);

    render(<FeedList onResetFilters={vi.fn()} />);

    // PostCardSkeleton has animated pulse divs
    expect(screen.queryByText(/Không tìm thấy bài phân tích/i)).toBeNull();
  });

  it('renders EmptyState with reset button when feed returns 0 posts', () => {
    vi.spyOn(HookModule, 'useCategoryMap').mockReturnValue({});
    vi.spyOn(HookModule, 'usePostsFeed').mockReturnValue({
      data: { pages: [{ data: [], meta: {} }] },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);

    const onResetFilters = vi.fn();
    render(<FeedList onResetFilters={onResetFilters} />);

    expect(screen.getByText(/Không tìm thấy bài phân tích/i)).toBeDefined();
    const resetButton = screen.getByRole('button', { name: /Xóa bộ lọc/i });
    fireEvent.click(resetButton);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it('renders post stream and "Load More Articles" button when hasNextPage is true', () => {
    const mockPost = {
      id: 'post-1',
      authorId: 'user-1',
      contentType: 'COMMUNITY' as const,
      title: 'Global Semiconductor Market Valuation',
      slug: 'global-semiconductor-market-valuation',
      body: null,
      coverMediaId: null,
      categoryId: 'cat-tech',
      status: 'PUBLISHED' as const,
      metaTitle: null,
      metaDescription: 'Quarterly financial analysis on fab equipment manufacturers.',
      viewCount: 820,
      publishedAt: '2026-08-15T00:00:00Z',
      createdAt: '2026-08-15T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      deletedAt: null,
    };

    vi.spyOn(HookModule, 'useCategoryMap').mockReturnValue({
      'cat-tech': { id: 'cat-tech', name: 'Technology', slug: 'tech', description: null, scope: 'COMMUNITY', icon: null, sortOrder: 1, createdAt: '' },
    });

    const mockFetchNextPage = vi.fn();
    vi.spyOn(HookModule, 'usePostsFeed').mockReturnValue({
      data: { pages: [{ data: [mockPost], meta: { page: 1, hasNextPage: true } }] },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      refetch: vi.fn(),
    } as any);

    render(<FeedList onResetFilters={vi.fn()} />);

    expect(screen.getByText(/Global Semiconductor Market Valuation/i)).toBeDefined();
    expect(screen.getByText('Technology')).toBeDefined();

    const loadMoreButton = screen.getByRole('button', { name: /Xem thêm bài viết/i });
    fireEvent.click(loadMoreButton);
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });
});
