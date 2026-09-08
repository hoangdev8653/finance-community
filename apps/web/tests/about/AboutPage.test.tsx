import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '../../app/gioi-thieu/page';

describe('AboutPage (/gioi-thieu)', () => {
  it('renders brand narrative and 7 pillars', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: /Câu chuyện thương hiệu BrewSeven/i })).toBeDefined();
    expect(screen.getByText(/Mỗi ngày một tách tri thức hảo hạng/i)).toBeDefined();
    expect(screen.getAllByText(/7 Nấc thang hoàn thiện bản thân/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tài chính vững vàng/i)).toBeDefined();
  });
});
