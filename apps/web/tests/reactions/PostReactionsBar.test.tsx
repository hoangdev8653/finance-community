import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostReactionsBar } from '@/components/reactions/PostReactionsBar';
import { useAuth } from '@/lib/auth/AuthContext';
import { usePostReactions, useTogglePostReaction } from '@/lib/reactions/use-reactions';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/reactions/use-reactions', () => ({
  usePostReactions: vi.fn(),
  useTogglePostReaction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/posts/community/sample-post',
  useRouter: () => ({ push: mockPush }),
}));

describe('PostReactionsBar Component', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
    vi.mocked(useTogglePostReaction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('renders reaction count, comment jump button, and share action', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    vi.mocked(usePostReactions).mockReturnValue({
      data: { total: 25, userReacted: false },
    } as any);

    render(<PostReactionsBar postId="post-1" commentCount={8} />);

    expect(screen.getByText('25')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();
    expect(screen.getByRole('button', { name: /Share this analysis link/i })).toBeDefined();
  });

  it('triggers toggle mutation when authenticated user clicks reaction', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    vi.mocked(usePostReactions).mockReturnValue({
      data: { total: 10, userReacted: false },
    } as any);

    render(<PostReactionsBar postId="post-1" />);

    const reactBtn = screen.getByRole('button', { name: /Like - Like this research analysis/i });
    fireEvent.click(reactBtn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /login when unauthenticated user clicks reaction', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    vi.mocked(usePostReactions).mockReturnValue({
      data: { total: 10, userReacted: false },
    } as any);

    render(<PostReactionsBar postId="post-1" />);

    const reactBtn = screen.getByRole('button', { name: /Like - Like this research analysis/i });
    fireEvent.click(reactBtn);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fposts%2Fcommunity%2Fsample-post');
  });
});
