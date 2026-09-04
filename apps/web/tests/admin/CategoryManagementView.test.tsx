import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/lib/toast/ToastContext';
import { CategoryManagementView } from '@/components/admin/CategoryManagementView';
import * as postsFeedHooks from '@/lib/posts/use-posts-feed';
import * as adminHooks from '@/lib/admin/use-admin';
import { postsService } from '@/lib/posts/posts-service';

vi.mock('@/lib/posts/use-posts-feed');
vi.mock('@/lib/admin/use-admin');
vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getDomains: vi.fn().mockResolvedValue([
      {
        id: 'domain-money',
        code: 'MONEY',
        slug: 'money',
        name: 'Money',
        nameVi: null,
        nameEn: null,
        description: null,
        sortOrder: 1,
        isActive: true,
        isPromoted: true,
        createdAt: '',
        updatedAt: '',
      },
    ]),
  },
}));

describe('CategoryManagementView Component', () => {
  const mockCreateCategory = vi.fn();
  const mockUpdateCategory = vi.fn();
  const mockDeleteCategory = vi.fn();
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.restoreAllMocks();
    mockCreateCategory.mockReset();
    mockUpdateCategory.mockReset();
    mockDeleteCategory.mockReset();
    vi.mocked(postsService.getDomains).mockResolvedValue([
      {
        id: 'domain-money',
        code: 'MONEY',
        slug: 'money',
        name: 'Money',
        nameVi: null,
        nameEn: null,
        description: null,
        sortOrder: 1,
        isActive: true,
        isPromoted: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    vi.mocked(adminHooks.useCreateCategory).mockReturnValue({
      mutateAsync: mockCreateCategory,
      isPending: false,
    } as any);

    vi.mocked(adminHooks.useUpdateCategory).mockReturnValue({
      mutateAsync: mockUpdateCategory,
      isPending: false,
    } as any);
    vi.mocked(adminHooks.useDeleteCategory).mockReturnValue({ mutateAsync: mockDeleteCategory, isPending: false } as any);
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

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CategoryManagementView />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Quản lý danh mục nội dung')).toBeDefined();
    expect(screen.getByText('Equity Derivatives')).toBeDefined();

    // Open New Category Modal
    const newBtn = screen.getByRole('button', { name: /Thêm danh mục/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: /Thêm danh mục/i })).toBeDefined();

    const nameInput = screen.getByLabelText(/Tên danh mục/i);
    fireEvent.change(nameInput, { target: { value: 'Commodities & FX' } });

    const domainSelect = await screen.findByLabelText(/Domain/i);
    await screen.findByRole('option', { name: 'Money' });
    fireEvent.change(domainSelect, { target: { value: 'domain-money' } });

    const submitBtn = screen.getByRole('button', { name: /Tạo danh mục/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'Commodities & FX',
        slug: 'commodities-fx',
        scope: 'COMMUNITY',
        domainId: 'domain-money',
        contentTypes: ['COMMUNITY'],
        description: undefined,
        sortOrder: 0,
      });
      expect(screen.getByText("Category 'Commodities & FX' created successfully.")).toBeDefined();
    });
  });
});
