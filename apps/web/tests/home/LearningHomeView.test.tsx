import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearningHomeView } from '@/components/home/LearningHomeView';
import { postsService } from '@/lib/posts/posts-service';
import { seriesService } from '@/lib/series/series-service';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LearningHomeView Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <LearningHomeView />
      </QueryClientProvider>
    );

  it('renders learning hero, search bar, and fallback categories when API is empty', () => {
    vi.spyOn(postsService, 'getCategories').mockResolvedValueOnce([]);
    vi.spyOn(seriesService, 'getAllSeries').mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 5, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    });
    vi.spyOn(postsService, 'getFeed').mockResolvedValueOnce({
      data: [],
      meta: { page: 1, limit: 3, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    });

    renderComponent();

    // Hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Học kiến thức tài chính/i);

    // Search input
    expect(screen.getByLabelText(/Tìm kiếm bài học/i)).toBeInTheDocument();

    // Default categories fallback
    expect(screen.getAllByText(/Quản lý tài chính/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Đầu tư/i).length).toBeGreaterThanOrEqual(1);

    // Default series fallback
    expect(screen.getAllByText(/Đầu tư chứng khoán/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders dynamic categories and series from API queries when available', async () => {
    vi.spyOn(postsService, 'getCategories').mockResolvedValueOnce([
      {
        id: 'cat-1',
        name: 'Phân tích kỹ thuật chuyên sâu',
        slug: 'phan-tich-ky-thuat',
        description: null,
        domainId: 'domain-1',
        scope: 'SERIES',
        contentTypes: ['SERIES'],
        parentId: null,
        sortOrder: 1,
        createdAt: '2026-01-01',
      },
    ]);

    vi.spyOn(seriesService, 'getAllSeries').mockResolvedValueOnce({
      data: [
        {
          id: 'series-1',
          name: 'Khóa học Tự do Tài chính 30 ngày',
          slug: 'tu-do-tai-chinh-30-ngay',
          description: 'Học cách quản lý chi tiêu và đầu tư',
          sortOrder: 1,
          publishedArticleCount: 15,
          createdAt: '2026-01-01',
        },
      ],
      meta: { page: 1, limit: 5, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    vi.spyOn(postsService, 'getFeed').mockResolvedValueOnce({
      data: [
        {
          id: 'post-1',
          title: 'Chiến lược phân bổ danh mục mùa BCTC 2026',
          slug: 'chien-luoc-phan-bo-danh-muc-2026',
          contentType: 'COMMUNITY',
          authorId: 'user-1',
          author: { username: 'investor99', displayName: 'Minh Tuấn' },
          viewCount: 3500,
          status: 'PUBLISHED',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        } as any,
      ],
      meta: { page: 1, limit: 3, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    });

    renderComponent();

    // Dynamic category rendered
    expect(await screen.findByText('Phân tích kỹ thuật chuyên sâu')).toBeInTheDocument();

    // Dynamic series rendered
    expect(await screen.findByText('Khóa học Tự do Tài chính 30 ngày')).toBeInTheDocument();
    expect(screen.getByText('15 bài học')).toBeInTheDocument();

    // Dynamic community post rendered
    expect(await screen.findByText('Chiến lược phân bổ danh mục mùa BCTC 2026')).toBeInTheDocument();
  });

  it('submits search query and navigates to /tim-kiem', () => {
    renderComponent();

    const input = screen.getByLabelText(/Tìm kiếm bài học/i);
    fireEvent.change(input, { target: { value: 'chứng khoán' } });

    const searchButton = screen.getByRole('button', { name: 'Tìm kiếm' });
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith('/tim-kiem?q=ch%E1%BB%A9ng%20kho%C3%A1n');
  });
});
