import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import * as searchHooks from '@/lib/search/use-search';
import * as postsFeedHooks from '@/lib/posts/use-posts-feed';

vi.mock('@/lib/search/use-search');
vi.mock('@/lib/posts/use-posts-feed');

describe('SearchResultsList Component', () => {
  it('renders matching posts and summary count', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Yield Curve Inversion Mechanics',
        slug: 'yield-curve-inversion',
        contentType: 'SERIES',
        excerpt: 'An analytical deep dive into yield curve dynamics.',
        publishedAt: '2026-08-16T00:00:00Z',
        createdAt: '2026-08-16T00:00:00Z',
        authorId: 'author-1',
        viewCount: 1420,
      },
    ];

    vi.mocked(searchHooks.useSearchDiscovery).mockReturnValue({
      data: {
        data: mockPosts,
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(postsFeedHooks.useCategoryMap).mockReturnValue({});

    render(<SearchResultsList filters={{ page: 1 }} onPageChange={vi.fn()} />);

    expect(screen.getByText('Yield Curve Inversion Mechanics')).toBeDefined();
    expect(screen.getByText(/Showing 1 of 1 publications/i)).toBeDefined();
  });

  it('renders empty state when no posts match', () => {
    vi.mocked(searchHooks.useSearchDiscovery).mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(postsFeedHooks.useCategoryMap).mockReturnValue({});

    render(<SearchResultsList filters={{ page: 1 }} onPageChange={vi.fn()} />);

    expect(screen.getByText(/No Matching Financial Articles/i)).toBeDefined();
  });
});
