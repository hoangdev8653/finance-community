import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHeader } from '@/components/content/PostHeader';
import { PostDetailResponse } from '@/types/content';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/posts/community/test-slug',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PostHeader Component', () => {
  const mockPost: PostDetailResponse = {
    id: 'post-1',
    authorId: '987fcdeb-51a2-43f7-9abc-1234567890ab',
    contentType: 'COMMUNITY',
    title: 'Macroeconomic Shift in Treasury Yields',
    slug: 'macroeconomic-shift-in-treasury-yields',
    body: '<p>A deep analytical piece containing more than two hundred words explaining the shift in short and long duration debt curves across multiple business cycles.</p>',
    coverMediaId: null,
    categoryId: 'cat-1',
    status: 'PUBLISHED',
    metaTitle: null,
    metaDescription: 'Executive summary detailing federal funds rates and yield curve inversions.',
    viewCount: 3450,
    publishedAt: '2026-08-15T12:00:00Z',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T12:00:00Z',
    deletedAt: null,
    tags: [],
    media: [],
  };

  it('renders title, category, author ID, views, and published date', () => {
    render(<PostHeader post={mockPost} categoryName="Fixed Income" />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Macroeconomic Shift in Treasury Yields/i })
    ).toBeDefined();
    expect(screen.getByText('Fixed Income')).toBeDefined();
    expect(screen.getByText(/Analyst #987fcdeb/i)).toBeDefined();
    expect(screen.getByText(/3,450 views/i)).toBeDefined();
    expect(screen.getByText(/August 15, 2026/i)).toBeDefined();
    expect(screen.getByText(/Executive summary detailing federal funds rates/i)).toBeDefined();
  });
});
