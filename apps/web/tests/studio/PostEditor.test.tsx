import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostEditor } from '@/components/studio/PostEditor';

vi.mock('@/lib/posts/posts-service', () => ({
  postsService: {
    getCategories: vi.fn().mockResolvedValue([
      { id: 'cat-1', name: 'Macroeconomics', slug: 'macro', scope: 'COMMUNITY' },
    ]),
    getTags: vi.fn().mockResolvedValue([]),
  },
}));

describe('PostEditor Component', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('renders title input, content type switch, body textarea, and calls callbacks', () => {
    const onTitleChange = vi.fn();
    const onContentTypeChange = vi.fn();
    const onBodyChange = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <PostEditor
          title="Macro Trends"
          contentType="COMMUNITY"
          tags={['rates']}
          body="Yield curve inversion analysis."
          metaTitle=""
          metaDescription=""
          onTitleChange={onTitleChange}
          onContentTypeChange={onContentTypeChange}
          onCategoryChange={vi.fn()}
          onTagsChange={vi.fn()}
          onBodyChange={onBodyChange}
          onMetaTitleChange={vi.fn()}
          onMetaDescriptionChange={vi.fn()}
          isAdmin={true}
        />
      </QueryClientProvider>
    );

    const titleInput = screen.getByLabelText(/Tiêu đề bài viết/i);
    expect((titleInput as HTMLInputElement).value).toBe('Macro Trends');

    fireEvent.change(titleInput, { target: { value: 'Updated Macro Trends' } });
    expect(onTitleChange).toHaveBeenCalledWith('Updated Macro Trends');

    expect(screen.getByText(/Nội dung bài viết/i)).toBeDefined();

    // Switch to SERIES
    expect(screen.getByText(/BÀI HỌC \/ SERIES/i)).toBeDefined();
  });
});
