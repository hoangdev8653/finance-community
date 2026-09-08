import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryCard } from '../../components/categories/CategoryCard';
import { CategoryEntity } from '@/types/content';

describe('CategoryCard', () => {
  it('links to /danh-muc/[slug] for community category', () => {
    const mockCategory: CategoryEntity = {
      id: 'cat-1',
      name: 'Tài chính cá nhân',
      slug: 'tai-chinh-ca-nhan',
      scope: 'COMMUNITY',
      description: 'Quản lý tài chính cá nhân',
      sortOrder: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    render(<CategoryCard category={mockCategory} />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/danh-muc/tai-chinh-ca-nhan');
    expect(screen.getByText('Tài chính cá nhân')).toBeDefined();
  });

  it('links to /series for series category', () => {
    const mockCategory: CategoryEntity = {
      id: 'cat-2',
      name: 'Định giá doanh nghiệp',
      slug: 'dinh-gia-doanh-nghiep',
      scope: 'SERIES',
      description: 'Giáo trình định giá',
      sortOrder: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    render(<CategoryCard category={mockCategory} />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/series');
  });
});
