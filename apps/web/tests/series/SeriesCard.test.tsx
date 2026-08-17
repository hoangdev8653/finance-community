import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeriesCard } from '@/components/series/SeriesCard';
import { SeriesItem } from '@/types/series';

describe('SeriesCard Component', () => {
  const mockSeries: SeriesItem = {
    id: 's-1',
    name: 'Advanced Equity Valuation',
    slug: 'advanced-equity-valuation',
    description: 'Masterclass on DCF models, WACC sensitivity, and terminal multiples.',
    sortOrder: 1,
    publishedArticleCount: 8,
    createdAt: '2026-08-15T00:00:00Z',
  };

  it('renders series name, description, exact chapter count badge, and link', () => {
    render(<SeriesCard series={mockSeries} />);

    expect(screen.getByText('Advanced Equity Valuation')).toBeDefined();
    expect(
      screen.getByText(
        'Masterclass on DCF models, WACC sensitivity, and terminal multiples.'
      )
    ).toBeDefined();
    expect(screen.getByText('8 Chapters')).toBeDefined();

    const links = screen.getAllByRole('link', { name: /Advanced Equity Valuation/i });
    expect(links[0].getAttribute('href')).toBe('/series/advanced-equity-valuation');
  });

  it('handles singular chapter count correctly', () => {
    const singleChapterSeries: SeriesItem = {
      ...mockSeries,
      publishedArticleCount: 1,
    };

    render(<SeriesCard series={singleChapterSeries} />);
    expect(screen.getByText('1 Chapter')).toBeDefined();
  });
});
