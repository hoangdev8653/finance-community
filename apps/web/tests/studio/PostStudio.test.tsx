import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostStudio } from '@/components/studio/PostStudio';
import { useCreatePost, useUpdatePost } from '@/lib/posts/use-post-mutations';
import { useAuth } from '@/lib/auth/AuthContext';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/posts/use-posts-feed', () => ({
  useCategoryMap: () => ({}),
}));

vi.mock('@/lib/posts/use-post-mutations', () => ({
  useCreatePost: vi.fn(),
  useUpdatePost: vi.fn(),
}));

vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getCategories: vi.fn().mockResolvedValue([]),
    getTags: vi.fn().mockResolvedValue([]),
  },
}));

describe('PostStudio Component', () => {
  let queryClient: QueryClient;
  const createMutateMock = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u-1', email: 'analyst@pulse.com', username: 'analyst', roles: ['USER'], status: 'ACTIVE' },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });
    vi.mocked(useCreatePost).mockReturnValue({
      mutateAsync: createMutateMock,
      isPending: false,
    } as any);
    vi.mocked(useUpdatePost).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it('validates title requirement and submits new post', async () => {
    createMutateMock.mockResolvedValueOnce({
      id: 'p-new',
      contentType: 'COMMUNITY',
      slug: 'quant-equity-factors',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PostStudio />
      </QueryClientProvider>
    );

    const publishBtn = screen.getByRole('button', { name: /Publish Now/i });
    fireEvent.click(publishBtn);

    // Should show error when title is empty
    expect(screen.getByText(/Analysis title is required/i)).toBeDefined();

    // Fill title
    const titleInput = screen.getByLabelText(/Analysis Title/i);
    fireEvent.change(titleInput, { target: { value: 'Quant Equity Factors' } });

    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(createMutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Quant Equity Factors',
          contentType: 'COMMUNITY',
          status: 'PUBLISHED',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/posts/COMMUNITY/quant-equity-factors');
    });
  });

  it('toggles live preview mode on button click', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PostStudio />
      </QueryClientProvider>
    );

    const previewToggleBtn = screen.getByRole('button', { name: /Live Preview/i });
    fireEvent.click(previewToggleBtn);

    expect(screen.getByRole('button', { name: /Exit Preview/i })).toBeDefined();
    expect(screen.getByText(/Untitled Financial Analysis/i)).toBeDefined();
  });
});
