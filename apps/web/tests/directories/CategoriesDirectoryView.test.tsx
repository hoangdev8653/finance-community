import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoriesDirectoryView } from '@/components/categories/CategoriesDirectoryView';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { CategoryEntity } from '@/types/content';

vi.mock('@/lib/posts/use-posts-feed');

describe('CategoriesDirectoryView Component', () => {
  const mockCategories: CategoryEntity[] = [
    {
      id: 'cat-1',
      name: 'Equity Valuation',
      slug: 'equity-valuation',
      description: 'Fundamental cash flow & multiple analysis.',
      scope: 'COMMUNITY',
      icon: null,
      sortOrder: 1,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'cat-2',
      name: 'Macro Strategy',
      slug: 'macro-strategy',
      description: 'Global rates and FX dynamics.',
      scope: 'COMMUNITY',
      icon: null,
      sortOrder: 2,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'cat-3',
      name: 'Fixed Income Academy',
      slug: 'fixed-income-academy',
      description: 'Bond curve analysis & duration management.',
      scope: 'SERIES',
      icon: null,
      sortOrder: 1,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Community research sectors and Educational series tracks separately', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
    } as any);

    render(<CategoriesDirectoryView />);

    expect(screen.getByText('Categories & Sectors')).toBeInTheDocument();
    expect(screen.getByText('Community Research & Analysis Sectors')).toBeInTheDocument();
    expect(screen.getByText('Educational Curriculums & Series Tracks')).toBeInTheDocument();

    expect(screen.getByText('Equity Valuation')).toBeInTheDocument();
    expect(screen.getByText('Macro Strategy')).toBeInTheDocument();
    expect(screen.getByText('Fixed Income Academy')).toBeInTheDocument();
  });

  it('provides correct explorer destination links on category cards', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
    } as any);

    render(<CategoriesDirectoryView />);

    const communityCardLink = screen.getByRole('link', { name: /Equity Valuation/i });
    expect(communityCardLink).toHaveAttribute('href', '/posts?categoryId=cat-1');

    const seriesCardLink = screen.getByRole('link', { name: /Fixed Income Academy/i });
    expect(seriesCardLink).toHaveAttribute('href', '/series');
  });

  it('renders empty state when no categories are returned', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    render(<CategoriesDirectoryView />);

    expect(screen.getByText('No categories found')).toBeInTheDocument();
  });
});
