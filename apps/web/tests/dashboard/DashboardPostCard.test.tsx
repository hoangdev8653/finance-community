import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardPostCard } from '@/components/dashboard/DashboardPostCard';
import { PostEntity } from '@/types/content';

vi.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" onClick={onClick}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

describe('DashboardPostCard Component', () => {
  const mockPost: PostEntity = {
    id: 'post-101',
    authorId: 'author-1',
    contentType: 'COMMUNITY',
    title: 'Semiconductor Foundry Margin Analysis',
    slug: 'semi-foundry-margin-analysis',
    body: 'Content...',
    coverMediaId: null,
    categoryId: 'cat-1',
    status: 'PUBLISHED',
    metaTitle: null,
    metaDescription: 'Detailed foundry valuation.',
    viewCount: 1420,
    publishedAt: '2026-08-10T12:00:00Z',
    createdAt: '2026-08-09T10:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
    deletedAt: null,
  };

  it('renders post title, content type badge, status badge, and view count', () => {
    render(<DashboardPostCard post={mockPost} />);

    expect(screen.getByText('Semiconductor Foundry Margin Analysis')).toBeInTheDocument();
    expect(screen.getByText('COMMUNITY')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('1,420 views')).toBeInTheDocument();
  });

  it('renders links to edit the post in Studio', () => {
    render(<DashboardPostCard post={mockPost} />);

    const editLinks = screen.getAllByRole('link', { name: /Edit/i });
    expect(editLinks.some((l) => l.getAttribute('href') === '/posts/post-101/edit')).toBe(true);
  });

  it('handles post status change callbacks', async () => {
    const handleUpdateStatus = vi.fn().mockResolvedValue({});
    const draftPost: PostEntity = { ...mockPost, status: 'DRAFT' };

    render(
      <DashboardPostCard
        post={draftPost}
        onUpdateStatus={handleUpdateStatus}
      />
    );

    const publishOption = screen.getByText('Publish Draft');
    await React.act(async () => {
      fireEvent.click(publishOption);
    });

    expect(handleUpdateStatus).toHaveBeenCalledWith('post-101', 'PUBLISHED');
  });

  it('opens delete confirmation modal and triggers delete callback', async () => {
    const handleDeletePost = vi.fn().mockResolvedValue({});

    render(
      <DashboardPostCard
        post={mockPost}
        onDeletePost={handleDeletePost}
      />
    );

    const deleteOption = screen.getByText('Delete Post');
    await React.act(async () => {
      fireEvent.click(deleteOption);
    });

    expect(screen.getByText('Delete Research Note')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    await React.act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(handleDeletePost).toHaveBeenCalledWith('post-101');
  });

  it('handles archive action callback for published post', async () => {
    const handleUpdateStatus = vi.fn().mockResolvedValue({});

    render(
      <DashboardPostCard
        post={mockPost}
        onUpdateStatus={handleUpdateStatus}
      />
    );

    const archiveOption = screen.getByText('Archive Note');
    await React.act(async () => {
      fireEvent.click(archiveOption);
    });

    expect(handleUpdateStatus).toHaveBeenCalledWith('post-101', 'ARCHIVED');
  });

  it('handles restore to draft action callback for archived post', async () => {
    const handleUpdateStatus = vi.fn().mockResolvedValue({});
    const archivedPost: PostEntity = { ...mockPost, status: 'ARCHIVED' };

    render(
      <DashboardPostCard
        post={archivedPost}
        onUpdateStatus={handleUpdateStatus}
      />
    );

    const restoreOption = screen.getByText('Restore to Draft');
    await React.act(async () => {
      fireEvent.click(restoreOption);
    });

    expect(handleUpdateStatus).toHaveBeenCalledWith('post-101', 'DRAFT');
  });
});
