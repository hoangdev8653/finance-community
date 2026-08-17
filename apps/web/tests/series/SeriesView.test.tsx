import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SeriesView } from '@/components/series/SeriesView';
import { seriesService } from '@/lib/series/series-service';
import { SeriesDetailResponse } from '@/types/series';

vi.mock('@/lib/series/series-service', () => ({
  seriesService: {
    getBySlug: vi.fn(),
  },
}));

describe('SeriesView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockInitialData: SeriesDetailResponse = {
    series: {
      id: 's-1',
      name: 'Fixed Income & Bond Math',
      slug: 'fixed-income-bond-math',
      description: 'Yield curves, duration, convexity, and spread analysis.',
      sortOrder: 2,
      createdAt: '2026-08-01T00:00:00Z',
    },
    articles: [
      {
        id: 'c-1',
        title: 'Macaulay & Modified Duration',
        slug: 'macaulay-modified-duration',
        status: 'PUBLISHED',
        publishedAt: '2026-08-01T00:00:00Z',
        viewCount: 180,
      },
    ],
    meta: {
      page: 1,
      limit: 20,
      totalItems: 2,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  };

  it('renders initial series header and chapter list', () => {
    render(<SeriesView initialData={mockInitialData} slug="fixed-income-bond-math" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Fixed Income & Bond Math' })).toBeDefined();
    expect(screen.getByText('Macaulay & Modified Duration')).toBeDefined();
    expect(screen.getByRole('button', { name: /Load More Chapters/i })).toBeDefined();
  });

  it('handles load more chapters without duplicate numbering', async () => {
    vi.mocked(seriesService.getBySlug).mockResolvedValueOnce({
      series: mockInitialData.series,
      articles: [
        {
          id: 'c-2',
          title: 'Convexity & Immunization',
          slug: 'convexity-immunization',
          status: 'PUBLISHED',
          publishedAt: '2026-08-05T00:00:00Z',
          viewCount: 140,
        },
      ],
      meta: {
        page: 2,
        limit: 20,
        totalItems: 2,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    render(<SeriesView initialData={mockInitialData} slug="fixed-income-bond-math" />);

    const loadMoreBtn = screen.getByRole('button', { name: /Load More Chapters/i });
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(screen.getByText('Convexity & Immunization')).toBeDefined();
      expect(screen.getByText('02')).toBeDefined();
      expect(screen.queryByRole('button', { name: /Load More Chapters/i })).toBeNull();
    });
  });
});
