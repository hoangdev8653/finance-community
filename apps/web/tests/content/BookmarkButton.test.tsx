import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkButton } from '@/components/content/BookmarkButton';
import { usePostBookmark } from '@/lib/posts/use-post-bookmark';

describe('BookmarkButton Component', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockToggle.mockClear();
  });

  it('renders unbookmarked state in icon variant and triggers toggle on click', () => {
    vi.mocked(usePostBookmark).mockReturnValue({
      isBookmarked: false,
      isLoading: false,
      toggleBookmark: mockToggle,
    });

    render(<BookmarkButton postId="post-123" variant="icon" />);

    const button = screen.getByRole('button', { name: 'Lưu bài viết' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders bookmarked state in labeled variant', () => {
    vi.mocked(usePostBookmark).mockReturnValue({
      isBookmarked: true,
      isLoading: false,
      toggleBookmark: mockToggle,
    });

    render(<BookmarkButton postId="post-123" variant="labeled" />);

    const button = screen.getByRole('button', { name: 'Bỏ lưu bài viết' });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Đã lưu')).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders pill variant with loading state disabled', () => {
    vi.mocked(usePostBookmark).mockReturnValue({
      isBookmarked: false,
      isLoading: true,
      toggleBookmark: mockToggle,
    });

    render(<BookmarkButton postId="post-123" variant="pill" size="sm" />);

    const button = screen.getByRole('button', { name: 'Lưu bài viết' });
    expect(button).toBeDisabled();
  });
});
