import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseItem } from '@/types/course';

describe('CourseCard Component', () => {
  const mockSeries: CourseItem = {
    id: 's-1',
    name: 'Advanced Equity Valuation',
    slug: 'advanced-equity-valuation',
    description: 'Masterclass on DCF models, WACC sensitivity, and terminal multiples.',
    sortOrder: 1,
    publishedArticleCount: 8,
    createdAt: '2026-08-15T00:00:00Z',
  };

  it('renders series name, description, exact chapter count badge, and link', () => {
    render(<CourseCard series={mockSeries} />);

    expect(screen.getByText('Advanced Equity Valuation')).toBeDefined();
    expect(
      screen.getByText(
        'Masterclass on DCF models, WACC sensitivity, and terminal multiples.'
      )
    ).toBeDefined();
    expect(screen.getByText('8 Bài học')).toBeDefined();

    const links = screen.getAllByRole('link', { name: /Advanced Equity Valuation/i });
    expect(links[0].getAttribute('href')).toBe('/khoa-hoc/advanced-equity-valuation');
  });

  it('handles singular chapter count correctly', () => {
    const singleChapterSeries: CourseItem = {
      ...mockSeries,
      publishedArticleCount: 1,
    };

    render(<CourseCard series={singleChapterSeries} />);
    expect(screen.getByText('1 Bài học')).toBeDefined();
  });
});
