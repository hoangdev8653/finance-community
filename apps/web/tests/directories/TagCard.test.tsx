import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagCard } from '@/components/tags/TagCard';
import { TagEntity } from '@/types/content';

describe('TagCard Component', () => {
  const mockTag: TagEntity = {
    id: 'tag-1',
    name: 'Semiconductors',
    slug: 'semiconductors',
    usageCount: 14,
    createdAt: '2026-08-01T00:00:00Z',
  };

  it('renders tag name and formatted usage count badge', () => {
    render(<TagCard tag={mockTag} />);

    expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    expect(screen.getByText('14 bài')).toBeInTheDocument();
  });

  it('links to the exact /tags/[slug] taxonomy route', () => {
    render(<TagCard tag={mockTag} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tags/semiconductors');
  });
});
