import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../../app/not-found';


describe('NotFound (404) Page', () => {
  it('renders 404 status indicator and heading', () => {
    render(<NotFound />);

    expect(screen.getAllByText('404').length).toBeGreaterThan(0);
    expect(screen.getByText('Trang bạn tìm kiếm không tồn tại')).toBeDefined();
    expect(screen.getByText(/Tín hiệu thị trường bị gián đoạn/i)).toBeDefined();
    expect(screen.getByText('Không tìm thấy tài nguyên')).toBeDefined();
  });

  it('renders primary navigation links to Home, Posts and Search', () => {
    render(<NotFound />);

    const homeLinks = screen.getAllByRole('link', { name: /Về Trang chủ/i });
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0].getAttribute('href')).toBe('/');

    const postsLinks = screen.getAllByRole('link', { name: /Khám phá bài viết/i });
    expect(postsLinks.length).toBeGreaterThan(0);
    expect(postsLinks[0].getAttribute('href')).toBe('/posts');

    const searchLink = screen.getByRole('link', { name: /Tra cứu nâng cao/i });
    expect(searchLink).toBeDefined();
    expect(searchLink.getAttribute('href')).toBe('/search');
  });



  it('renders search form input', () => {
    render(<NotFound />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm bài viết, mã cổ phiếu, tác giả.../i);
    expect(searchInput).toBeDefined();
  });

  it('renders quick directory shortcuts', () => {
    render(<NotFound />);

    expect(screen.getByText('Chuỗi bài học (Series)')).toBeDefined();
    expect(screen.getByText('Danh mục chủ đề')).toBeDefined();
    expect(screen.getByText('Thư mục Tag')).toBeDefined();
  });
});
