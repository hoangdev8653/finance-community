import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentItem } from '@/components/content/CommentItem';
import { useAuth } from '@/lib/auth/AuthContext';
import { ThreadedComment } from '@/types/comments';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/reactions/use-reactions', () => ({
  useCommentReactions: () => ({ data: { total: 0, userReacted: false } }),
  useToggleCommentReaction: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('CommentItem Component', () => {
  const activeComment: ThreadedComment = {
    id: 'c-1',
    postId: 'post-1',
    authorId: 'author-123',
    parentId: null,
    body: 'The terminal growth rate assumption of 2.5% is realistic.',
    status: 'VISIBLE',
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-08-15T12:00:00Z',
    deletedAt: null,
    isDeleted: false,
    authorProfile: {
      username: 'quant_fund',
      displayName: 'Quant Fund Manager',
      avatarMediaId: null,
    },
    replies: [],
  };

  it('renders author displayName/username, formatted date, and plain text body', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'other-user', email: 'other@test.com', username: 'other', roles: ['USER'], status: 'ACTIVE' },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    render(
      <CommentItem
        comment={activeComment}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/@Quant Fund Manager/i)).toBeDefined();
    expect(screen.getByText(/The terminal growth rate assumption of 2.5% is realistic./i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Reply/i })).toBeDefined();
  });

  it('renders soft-deleted state with disabled actions and masked text', () => {
    const deletedComment: ThreadedComment = {
      ...activeComment,
      isDeleted: true,
      body: '[Comment deleted]',
      authorProfile: {
        username: '[deleted]',
        displayName: null,
        avatarMediaId: null,
      },
    };

    render(
      <CommentItem
        comment={deletedComment}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/@\[deleted\]/i)).toBeDefined();
    expect(screen.getByText(/\[Comment deleted\]/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Reply/i })).toBeNull();
  });

  it('allows author to edit their own comment', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'author-123', email: 'author@test.com', username: 'author', roles: ['USER'], status: 'ACTIVE' },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    const onEditMock = vi.fn().mockResolvedValue(undefined);

    render(
      <CommentItem
        comment={activeComment}
        onReply={vi.fn()}
        onEdit={onEditMock}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Edit comment/i });
    fireEvent.click(editBtn);

    const editTextarea = screen.getByLabelText(/Edit comment/i);
    fireEvent.change(editTextarea, { target: { value: 'Updated terminal rate to 3.0%.' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onEditMock).toHaveBeenCalledWith('c-1', 'Updated terminal rate to 3.0%.');
    });
  });
});
