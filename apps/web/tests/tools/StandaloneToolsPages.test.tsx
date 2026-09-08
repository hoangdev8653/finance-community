import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompoundInterestPage from '../../app/cong-cu/lai-kep/page';
import LoanCalculatorPage from '../../app/cong-cu/tinh-khoan-vay/page';
import StockValuationPage from '../../app/cong-cu/dinh-gia-co-phieu/page';

describe('Standalone Tools Pages', () => {
  it('renders CompoundInterestPage with title and educational section', () => {
    render(<CompoundInterestPage />);

    expect(screen.getByRole('heading', { name: /Bảng tính Lãi kép & Tự do tài chính/i })).toBeDefined();
    expect(screen.getByText(/Nguyên lý cốt lõi của Lãi kép/i)).toBeDefined();
    expect(screen.getByText(/Compound Interest Calculator/i)).toBeDefined();
  });

  it('renders LoanCalculatorPage with title and educational section', () => {
    render(<LoanCalculatorPage />);

    expect(screen.getByRole('heading', { name: /Bảng tính Lãi vay Mua nhà & Xe/i })).toBeDefined();
    expect(screen.getByText(/Nguyên tắc vàng khi vay mua nhà và xe ngân hàng/i)).toBeDefined();
    expect(screen.getByText(/Loan & Mortgage Calculator/i)).toBeDefined();
  });

  it('renders StockValuationPage with title and educational section', () => {
    render(<StockValuationPage />);

    expect(screen.getByRole('heading', { name: /Mô hình Định giá Cổ phiếu & Biên an toàn/i })).toBeDefined();
    expect(screen.getByText(/Triết lý đầu tư giá trị & Biên an toàn/i)).toBeDefined();
    expect(screen.getByText(/Stock Valuation & Margin of Safety/i)).toBeDefined();
  });
});
