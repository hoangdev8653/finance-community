import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCoverMedia } from '@/components/content/PostCoverMedia';
import { PostDetailResponse } from '@/types/content';

describe('PostCoverMedia Component', () => {
  const basePost: PostDetailResponse = {
    id: 'post-1',
    authorId: 'author-1',
    contentType: 'COMMUNITY',
    title: 'Post Title',
    slug: 'post-title',
    body: '<p>Content</p>',
    coverMediaId: null,
    categoryId: null,
    status: 'PUBLISHED',
    metaTitle: null,
    metaDescription: null,
    viewCount: 100,
    publishedAt: '2026-08-15T00:00:00Z',
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
    deletedAt: null,
    tags: [],
    media: [],
  };

  it('renders image when matching coverMediaId is provided', () => {
    const postWithCover: PostDetailResponse = {
      ...basePost,
      coverMediaId: 'media-1',
      media: [
        {
          id: 'media-1',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/cover.jpg',
          purpose: 'cover',
          sortOrder: 0,
        },
      ],
    };

    render(<PostCoverMedia post={postWithCover} />);

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('cover.jpg');
    expect(img.getAttribute('alt')).toBe('Post Title');
  });

  it('returns null when no media is present', () => {
    const { container } = render(<PostCoverMedia post={basePost} />);
    expect(container.firstChild).toBeNull();
  });
});
