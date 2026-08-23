import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/content/PostCard';
import { PostEntity } from '@/types/content';

describe('PostCard Component', () => {
  const mockPost: PostEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    authorId: '987fcdeb-51a2-43f7-9abc-1234567890ab',
    contentType: 'COMMUNITY',
    title: 'Yield Curve Inversion Deep Dive',
    slug: 'yield-curve-inversion-deep-dive',
    body: null,
    coverMediaId: null,
    categoryId: 'cat-123',
    status: 'PUBLISHED',
    metaTitle: null,
    metaDescription: 'Comprehensive breakdown of historical treasury yield curve dynamics.',
    viewCount: 1540,
    publishedAt: '2026-08-15T14:30:00Z',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T14:30:00Z',
    deletedAt: null,
  };

  it('renders post title, excerpt, view count, and formatted publication date', () => {
    render(<PostCard post={mockPost} categoryName="Fixed Income" />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Yield Curve Inversion Deep Dive/i })
    ).toBeDefined();
    expect(
      screen.getByText(/Comprehensive breakdown of historical treasury yield curve dynamics/i)
    ).toBeDefined();
    expect(screen.getByText('Fixed Income')).toBeDefined();
    expect(screen.getByText(/15\/8\/2026/)).toBeDefined();
  });

  it('links to /posts/:contentType/:slug correctly', () => {
    render(<PostCard post={mockPost} />);

    const titleLink = screen.getByRole('link', {
      name: /Yield Curve Inversion Deep Dive/i,
    });
    expect(titleLink.getAttribute('href')).toBe('/posts/community/yield-curve-inversion-deep-dive');
  });
});
