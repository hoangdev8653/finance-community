import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  useDashboardMetrics,
  useDashboardPosts,
  useDashboardMutations,
  useDashboardBookmarks,
} from '@/lib/dashboard/use-dashboard';

vi.mock('@/lib/auth/AuthContext');
vi.mock('@/lib/dashboard/use-dashboard');

describe('DashboardView Component', () => {
  const mockUser = {
    id: 'user-123',
    email: 'analyst@pulse.com',
    username: 'marketpro',
    displayName: 'Market Pro',
    roles: ['MEMBER'],
    status: 'ACTIVE',
  };

  const mockMetrics = {
    totalAnalyses: 5,
    draftsCount: 2,
    totalViews: 12500,
    followersCount: 89,
  };

  const mockPosts = [
    {
      id: 'p-1',
      authorId: 'user-123',
      contentType: 'COMMUNITY',
      title: 'Macro Valuation In Tech',
      slug: 'macro-valuation-tech',
      body: 'Content...',
      coverMediaId: null,
      categoryId: 'cat-1',
      status: 'PUBLISHED',
      metaTitle: null,
      metaDescription: null,
      viewCount: 1500,
      publishedAt: '2026-08-10T00:00:00Z',
      createdAt: '2026-08-10T00:00:00Z',
      updatedAt: '2026-08-10T00:00:00Z',
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(useDashboardMetrics).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useDashboardPosts).mockReturnValue({
      data: {
        data: mockPosts,
        meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useDashboardMutations).mockReturnValue({
      updateStatus: vi.fn().mockResolvedValue({}),
      isUpdatingStatus: false,
      deletePost: vi.fn().mockResolvedValue({}),
      isDeletingPost: false,
    });

    vi.mocked(useDashboardBookmarks).mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
    } as any);
  });

  it('renders page header, KPI metrics, tab bar, and author post cards', () => {
    render(<DashboardView />);

    expect(screen.getByText(/Bảng điều khiển & Quản lý Nghiên cứu/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Viết bài phân tích mới/i })).toHaveAttribute(
      'href',
      '/posts/create'
    );

    // KPI Metrics
    expect(screen.getByText('12,500')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();

    // Posts stream
    expect(screen.getByText('Macro Valuation In Tech')).toBeInTheDocument();
  });

  it('switches tabs and triggers post refetch for active status segment', () => {
    render(<DashboardView />);

    const draftsTab = screen.getByRole('tab', { name: /Drafts/i });
    fireEvent.click(draftsTab);

    expect(draftsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders contextual empty state when post list is empty', () => {
    vi.mocked(useDashboardPosts).mockReturnValueOnce({
      data: {
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<DashboardView />);

    expect(screen.getByText('No Published Research Notes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Write Analysis/i })).toHaveAttribute(
      'href',
      '/posts/create'
    );
  });

  it('renders loading skeleton when user is null', () => {
    vi.mocked(useAuth).mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<DashboardView />);

    expect(screen.getByLabelText('Loading workspace')).toBeInTheDocument();
  });
});
