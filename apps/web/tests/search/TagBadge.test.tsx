import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagBadge } from '@/components/search/TagBadge';

describe('TagBadge Component', () => {
  it('renders hashtag text and links to /tags/[slug]', () => {
    render(<TagBadge name="macroeconomics" slug="macroeconomics" />);

    const link = screen.getByRole('link', { name: '#macroeconomics' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/tags/macroeconomics');
  });
});
