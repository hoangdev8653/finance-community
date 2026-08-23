import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentsSection } from '@/components/content/CommentsSection';
import {
  usePostComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/lib/comments/use-comments';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/comments/use-comments', () => ({
  usePostComments: vi.fn(),
  useCreateComment: vi.fn(),
  useUpdateComment: vi.fn(),
  useDeleteComment: vi.fn(),
}));

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/reactions/use-reactions', () => ({
  useCommentReactions: () => ({ data: { total: 0, userReacted: false } }),
  useToggleCommentReaction: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/lib/media/use-media', () => ({
  useUploadMedia: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    uploadProgress: 0,
  }),
}));

import { ToastProvider } from '@/lib/toast/ToastContext';

const renderWithToast = (ui: React.ReactElement) => render(<ToastProvider>{ui}</ToastProvider>);

describe('CommentsSection Component', () => {
  beforeEach(() => {
    vi.mocked(useCreateComment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(useUpdateComment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(useDeleteComment).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });
  });

  it('renders loading skeleton when fetching comments', () => {
    vi.mocked(usePostComments).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithToast(<CommentsSection postId="post-1" />);

    expect(screen.getByRole('heading', { level: 2, name: /Discussion/i })).toBeDefined();
  });

  it('renders empty state when no comments exist', () => {
    vi.mocked(usePostComments).mockReturnValue({
      data: { data: [], meta: { totalItems: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithToast(<CommentsSection postId="post-1" />);

    expect(screen.getByText(/No analytical comments yet/i)).toBeDefined();
  });

  it('renders comments stream and total count when comments are loaded', () => {
    vi.mocked(usePostComments).mockReturnValue({
      data: {
        data: [
          {
            id: 'c-1',
            postId: 'post-1',
            authorId: 'user-1',
            parentId: null,
            body: 'Outstanding analysis of credit spreads.',
            status: 'VISIBLE',
            createdAt: '2026-08-15T12:00:00Z',
            updatedAt: '2026-08-15T12:00:00Z',
            deletedAt: null,
            isDeleted: false,
            authorProfile: {
              username: 'fixed_income_lead',
              displayName: 'Fixed Income Desk',
              avatarMediaId: null,
            },
          },
        ],
        meta: {
          totalItems: 1,
          hasNextPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithToast(<CommentsSection postId="post-1" />);

    expect(screen.getByRole('heading', { level: 2, name: /Discussion \(1\)/i })).toBeDefined();
    expect(screen.getByText(/Outstanding analysis of credit spreads./i)).toBeDefined();
  });
});
