import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeriesChapterList } from '@/components/series/SeriesChapterList';
import { SeriesArticleItem } from '@/types/series';

describe('SeriesChapterList Component', () => {
  const mockChapters: SeriesArticleItem[] = [
    {
      id: 'c-1',
      title: 'Discounted Cash Flow Fundamentals',
      slug: 'dcf-fundamentals',
      status: 'PUBLISHED',
      publishedAt: '2026-08-01T00:00:00Z',
      viewCount: 320,
    },
    {
      id: 'c-2',
      title: 'WACC & Cost of Capital Calculation',
      slug: 'wacc-cost-of-capital',
      status: 'PUBLISHED',
      publishedAt: '2026-08-05T00:00:00Z',
      viewCount: 215,
    },
  ];

  it('renders chapter sequence numbering, titles, view counts, and reader links', () => {
    render(<SeriesChapterList chapters={mockChapters} />);

    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('Discounted Cash Flow Fundamentals')).toBeDefined();
    expect(screen.getByText('320 views')).toBeDefined();

    expect(screen.getByText('02')).toBeDefined();
    expect(screen.getByText('WACC & Cost of Capital Calculation')).toBeDefined();
    expect(screen.getByText('215 views')).toBeDefined();

    const firstLink = screen.getByRole('link', {
      name: /Read Chapter 1: Discounted Cash Flow Fundamentals/i,
    });
    expect(firstLink.getAttribute('href')).toBe('/posts/SERIES/dcf-fundamentals');
  });

  it('renders load-more button when hasNextPage is true and triggers callback', () => {
    const onLoadMore = vi.fn();

    render(
      <SeriesChapterList
        chapters={mockChapters}
        hasNextPage={true}
        onLoadMore={onLoadMore}
      />
    );

    const loadMoreBtn = screen.getByRole('button', { name: /Load More Chapters/i });
    expect(loadMoreBtn).toBeDefined();

    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders empty state when chapter list is empty', () => {
    render(<SeriesChapterList chapters={[]} />);
    expect(screen.getByText(/No published chapters in this series yet/i)).toBeDefined();
  });
});
