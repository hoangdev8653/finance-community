import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentReactionButton } from '@/components/reactions/CommentReactionButton';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCommentReactions, useToggleCommentReaction } from '@/lib/reactions/use-reactions';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/reactions/use-reactions', () => ({
  useCommentReactions: vi.fn(),
  useToggleCommentReaction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/posts/community/sample-post',
  useRouter: () => ({ push: mockPush }),
}));

describe('CommentReactionButton Component', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
    vi.mocked(useToggleCommentReaction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('renders comment reaction count and inactive state', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    vi.mocked(useCommentReactions).mockReturnValue({
      data: { total: 4, userReacted: false },
    } as any);

    render(<CommentReactionButton commentId="c-1" />);

    expect(screen.getByText('4')).toBeDefined();
    const btn = screen.getByRole('button', { name: /Like - Like comment/i });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('triggers comment toggle mutation when clicked by authenticated user', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    vi.mocked(useCommentReactions).mockReturnValue({
      data: { total: 4, userReacted: false },
    } as any);

    render(<CommentReactionButton commentId="c-1" />);

    const btn = screen.getByRole('button', { name: /Like - Like comment/i });
    fireEvent.click(btn);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /login when clicked by unauthenticated user', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    vi.mocked(useCommentReactions).mockReturnValue({
      data: { total: 4, userReacted: false },
    } as any);

    render(<CommentReactionButton commentId="c-1" />);

    const btn = screen.getByRole('button', { name: /Like - Like comment/i });
    fireEvent.click(btn);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fposts%2Fcommunity%2Fsample-post');
  });
});
