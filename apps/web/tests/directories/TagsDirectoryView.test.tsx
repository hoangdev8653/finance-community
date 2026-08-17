import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagsDirectoryView } from '@/components/tags/TagsDirectoryView';
import { useTags } from '@/lib/posts/use-posts-feed';
import { TagEntity } from '@/types/content';

vi.mock('@/lib/posts/use-posts-feed');

describe('TagsDirectoryView Component', () => {
  const mockTags: TagEntity[] = [
    { id: 't1', name: 'Macroeconomics', slug: 'macroeconomics', usageCount: 25, createdAt: '2026-08-01T00:00:00Z' },
    { id: 't2', name: 'Monetary Policy', slug: 'monetary-policy', usageCount: 18, createdAt: '2026-08-01T00:00:00Z' },
    { id: 't3', name: 'Banking', slug: 'banking', usageCount: 8, createdAt: '2026-08-01T00:00:00Z' },
    { id: 't4', name: '10Y Treasury', slug: '10y-treasury', usageCount: 12, createdAt: '2026-08-01T00:00:00Z' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders page header, popular market tags, and alphabetical tag sections', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      isError: false,
    } as any);

    render(<TagsDirectoryView />);

    expect(screen.getByText('Market Tags & Research Topics')).toBeInTheDocument();
    expect(screen.getByText('Popular Market Tags')).toBeInTheDocument();

    // Alphabetical headers
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('#')).toBeInTheDocument();

    // Tag items
    expect(screen.getAllByText('Macroeconomics').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Banking').length).toBeGreaterThanOrEqual(1);
  });

  it('filters tags dynamically by search input keyword', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      isError: false,
    } as any);

    render(<TagsDirectoryView />);

    const searchInput = screen.getByRole('textbox', { name: /Filter market tags/i });
    fireEvent.change(searchInput, { target: { value: 'Bank' } });

    expect(screen.getByText('Banking')).toBeInTheDocument();
    expect(screen.queryByText('Macroeconomics')).not.toBeInTheDocument();
  });

  it('renders contextual empty state when no tags match search keyword', () => {
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      isError: false,
    } as any);

    render(<TagsDirectoryView />);

    const searchInput = screen.getByRole('textbox', { name: /Filter market tags/i });
    fireEvent.change(searchInput, { target: { value: 'NonexistentTag' } });

    expect(screen.getByText(/No tags matching "NonexistentTag"/i)).toBeInTheDocument();
  });

  it('renders loading skeleton when tags are being fetched', () => {
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    } as any);

    render(<TagsDirectoryView />);

    expect(screen.getByLabelText('Loading market tags')).toBeInTheDocument();
  });
});
