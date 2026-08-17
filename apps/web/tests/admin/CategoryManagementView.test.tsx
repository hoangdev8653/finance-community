import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryManagementView } from '@/components/admin/CategoryManagementView';
import * as postsFeedHooks from '@/lib/posts/use-posts-feed';
import * as adminHooks from '@/lib/admin/use-admin';

vi.mock('@/lib/posts/use-posts-feed');
vi.mock('@/lib/admin/use-admin');

describe('CategoryManagementView Component', () => {
  const mockCreateCategory = vi.fn();
  const mockUpdateCategory = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockCreateCategory.mockReset();
    mockUpdateCategory.mockReset();

    vi.mocked(adminHooks.useCreateCategory).mockReturnValue({
      mutateAsync: mockCreateCategory,
      isPending: false,
    } as any);

    vi.mocked(adminHooks.useUpdateCategory).mockReturnValue({
      mutateAsync: mockUpdateCategory,
      isPending: false,
    } as any);
  });

  it('renders categories list and creates new category', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Equity Derivatives',
        slug: 'equity-derivatives',
        scope: 'COMMUNITY',
        description: 'Options and futures trading strategies',
        sortOrder: 1,
        createdAt: '2026-08-16T00:00:00Z',
        updatedAt: '2026-08-16T00:00:00Z',
      },
    ];

    vi.mocked(postsFeedHooks.useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    mockCreateCategory.mockResolvedValueOnce({
      id: 'cat-2',
      name: 'Commodities & FX',
      slug: 'commodities-fx',
      scope: 'COMMUNITY',
      description: null,
      sortOrder: 0,
      createdAt: '2026-08-16T00:00:00Z',
      updatedAt: '2026-08-16T00:00:00Z',
    });

    render(<CategoryManagementView />);

    expect(screen.getByText('Content Category Management')).toBeDefined();
    expect(screen.getByText('Equity Derivatives')).toBeDefined();

    // Open New Category Modal
    const newBtn = screen.getByRole('button', { name: /New Category/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: 'Create Content Category' })).toBeDefined();

    const nameInput = screen.getByLabelText(/Category Name/i);
    fireEvent.change(nameInput, { target: { value: 'Commodities & FX' } });

    const submitBtn = screen.getByRole('button', { name: 'Create Category' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'Commodities & FX',
        slug: 'commodities-fx',
        scope: 'COMMUNITY',
        description: undefined,
        sortOrder: 0,
      });
      expect(screen.getByText(/Category 'Commodities & FX' created successfully/i)).toBeDefined();
    });
  });
});
