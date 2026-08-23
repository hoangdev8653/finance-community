import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilterBar } from '@/components/content/CategoryFilterBar';
import * as HookModule from '@/lib/posts/use-posts-feed';

describe('CategoryFilterBar Component', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Macroeconomics',
      slug: 'macro',
      description: null,
      scope: 'COMMUNITY' as const,
      icon: null,
      sortOrder: 1,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'cat-2',
      name: 'Equities',
      slug: 'equities',
      description: null,
      scope: 'COMMUNITY' as const,
      icon: null,
      sortOrder: 2,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ];

  it('renders "All Topics" and category pill buttons with active states', () => {
    vi.spyOn(HookModule, 'useCategories').mockReturnValue({
      data: mockCategories,
      isLoading: false,
    } as any);

    const onSelectCategory = vi.fn();

    render(
      <CategoryFilterBar
        selectedCategoryId="cat-1"
        onSelectCategory={onSelectCategory}
      />
    );

    const allButton = screen.getByRole('button', { name: /Tất cả|All/i });
    const macroButton = screen.getByRole('button', { name: /Macroeconomics/i });
    const equitiesButton = screen.getByRole('button', { name: /Equities/i });

    expect(allButton.getAttribute('aria-pressed')).toBe('false');
    expect(macroButton.getAttribute('aria-pressed')).toBe('true');
    expect(equitiesButton.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(equitiesButton);
    expect(onSelectCategory).toHaveBeenCalledWith('cat-2');

    fireEvent.click(allButton);
    expect(onSelectCategory).toHaveBeenCalledWith(undefined);
  });
});
