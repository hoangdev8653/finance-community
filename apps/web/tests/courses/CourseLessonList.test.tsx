import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseLessonList } from '@/components/courses/CourseLessonList';
import { CourseLesson } from '@/types/course';

describe('CourseLessonList Component', () => {
  const mockChapters: CourseLesson[] = [
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
    render(<CourseLessonList chapters={mockChapters} seriesSlug="fixed-income-bond-math" />);

    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('Discounted Cash Flow Fundamentals')).toBeDefined();
    expect(screen.getByText((content) => content.includes('320'))).toBeDefined();

    expect(screen.getByText('02')).toBeDefined();
    expect(screen.getByText('WACC & Cost of Capital Calculation')).toBeDefined();
    expect(screen.getByText((content) => content.includes('215'))).toBeDefined();

    const firstLink = screen.getByRole('link', {
      name: /Đọc Chương 1: Discounted Cash Flow Fundamentals/i,
    });
    expect(firstLink.getAttribute('href')).toBe('/khoa-hoc/fixed-income-bond-math/dcf-fundamentals');
  });

  it('renders load-more button when hasNextPage is true and triggers callback', () => {
    const onLoadMore = vi.fn();

    render(
      <CourseLessonList
        chapters={mockChapters}
        seriesSlug="fixed-income-bond-math"
        hasNextPage={true}
        onLoadMore={onLoadMore}
      />
    );

    const loadMoreBtn = screen.getByRole('button', { name: /Xem thêm bài học/i });
    expect(loadMoreBtn).toBeDefined();

    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders empty state when chapter list is empty', () => {
    render(<CourseLessonList chapters={[]} seriesSlug="fixed-income-bond-math" />);
    expect(screen.getByText(/Khóa học này chưa có bài học được xuất bản/i)).toBeDefined();
  });
});
