import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilterBar } from '@/components/search/SearchFilterBar';
import * as postsFeedHooks from '@/lib/posts/use-posts-feed';
import * as searchHooks from '@/lib/search/use-search';

vi.mock('@/lib/posts/use-posts-feed');
vi.mock('@/lib/search/use-search');

describe('SearchFilterBar Component', () => {
  const mockChange = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockChange.mockReset();

    vi.mocked(postsFeedHooks.useCategories).mockReturnValue({
      data: [{ id: 'cat-1', name: 'Fixed Income', slug: 'fixed-income', scope: 'SERIES' }],
    } as any);

    vi.mocked(searchHooks.useSearchTags).mockReturnValue({
      data: [{ id: 'tag-1', name: 'bonds', slug: 'bonds' }],
    } as any);
  });

  it('renders filter controls and triggers onChange on selection', () => {
    render(
      <SearchFilterBar
        filters={{ contentType: 'ALL', sortBy: 'publishedAt', order: 'DESC' }}
        onChange={mockChange}
      />
    );

    expect(screen.getByText(/Bộ Lọc Chuyên Sâu/i)).toBeDefined();

    const scopeSelect = screen.getByLabelText(/Định dạng/i);
    fireEvent.change(scopeSelect, { target: { value: 'SERIES' } });

    expect(mockChange).toHaveBeenCalledWith({
      contentType: 'SERIES',
      sortBy: 'publishedAt',
      order: 'DESC',
      page: 1,
    });
  });

  it('triggers reset filters on Reset button click', () => {
    render(
      <SearchFilterBar
        filters={{ contentType: 'SERIES', sortBy: 'createdAt', order: 'ASC' }}
        onChange={mockChange}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetBtn);

    expect(mockChange).toHaveBeenCalledWith({
      contentType: 'ALL',
      categoryId: undefined,
      tagId: undefined,
      sortBy: 'publishedAt',
      order: 'DESC',
      page: 1,
    });
  });
});
