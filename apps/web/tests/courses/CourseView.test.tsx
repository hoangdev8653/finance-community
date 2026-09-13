import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseView } from '@/components/courses/CourseView';
import { courseService } from '@/lib/courses/course-service';
import { CourseDetailResponse } from '@/types/course';

vi.mock('@/lib/courses/course-service', () => ({
  courseService: {
    getBySlug: vi.fn(),
  },
}));

describe('CourseView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockInitialData: CourseDetailResponse = {
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
    render(<CourseView initialData={mockInitialData} slug="fixed-income-bond-math" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Fixed Income & Bond Math' })).toBeDefined();
    expect(screen.getByText('Macaulay & Modified Duration')).toBeDefined();
    expect(screen.getByRole('button', { name: /Xem thêm bài học/i })).toBeDefined();
  });

  it('handles load more chapters without duplicate numbering', async () => {
    vi.mocked(courseService.getBySlug).mockResolvedValueOnce({
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

    render(<CourseView initialData={mockInitialData} slug="fixed-income-bond-math" />);

    const loadMoreBtn = screen.getByRole('button', { name: /Xem thêm bài học/i });
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(screen.getByText('Convexity & Immunization')).toBeDefined();
      expect(screen.getByText('02')).toBeDefined();
      expect(screen.queryByRole('button', { name: /Xem thêm bài học/i })).toBeNull();
    });
  });
});
