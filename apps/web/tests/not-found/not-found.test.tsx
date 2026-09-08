import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../../app/not-found';

describe('NotFound (404) Page', () => {
  it('renders 404 heading and main container', () => {
    const { container } = render(<NotFound />);

    expect(screen.getByText('Oops! Trang bạn tìm kiếm không tồn tại.')).toBeDefined();
    expect(container.querySelector('[data-not-found-page="true"]')).toBeDefined();
  });

  it('renders navigation links to Home and Explore Posts', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /Về trang chủ/i });
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute('href')).toBe('/');

    const exploreLink = screen.getByRole('link', { name: /Khám phá bài viết/i });
    expect(exploreLink).toBeDefined();
    expect(exploreLink.getAttribute('href')).toBe('/bai-viet');
  });

  it('renders decorative illustrations', () => {
    const { container } = render(<NotFound />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });
});
