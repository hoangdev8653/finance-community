import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostContentRenderer } from '@/components/content/PostContentRenderer';

describe('PostContentRenderer Component', () => {
  it('renders sanitized HTML body with styled typography', () => {
    const htmlBody = `
      <h2>Market Valuation Multiple Analysis</h2>
      <p>Trading multiples have compressed across regional banking sectors.</p>
      <blockquote>Asset quality metrics remain resilient.</blockquote>
    `;

    render(<PostContentRenderer body={htmlBody} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Market Valuation Multiple Analysis/i })
    ).toBeDefined();
    expect(
      screen.getByText(/Trading multiples have compressed across regional banking sectors/i)
    ).toBeDefined();
    expect(screen.getByText(/Asset quality metrics remain resilient/i)).toBeDefined();
  });

  it('renders fallback notice when body is empty', () => {
    render(<PostContentRenderer body="" />);
    expect(screen.getByText(/No content provided for this analysis/i)).toBeDefined();
  });
});
