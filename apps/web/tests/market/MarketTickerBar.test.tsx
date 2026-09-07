import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarketTickerBar } from '@/components/market/MarketTickerBar';

describe('MarketTickerBar Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MarketTickerBar />
      </QueryClientProvider>
    );

  it('renders market ticker bar with live indicator badge', () => {
    renderComponent();

    expect(screen.getByTestId('market-ticker-bar')).toBeInTheDocument();
    expect(screen.getByText('Thị Trường')).toBeInTheDocument();
  });

  it('renders default financial symbols and quotes', () => {
    renderComponent();

    // Symbols are rendered twice due to the seamless infinite marquee loop
    expect(screen.getAllByText('VN-INDEX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('BTC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('VCB').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles visibility when hide and show buttons are clicked', () => {
    renderComponent();

    const hideButton = screen.getByRole('button', { name: /Ẩn dải chỉ số/i });
    fireEvent.click(hideButton);

    // Ticker bar is hidden, replaced with show button
    expect(screen.queryByTestId('market-ticker-bar')).not.toBeInTheDocument();
    const showButton = screen.getByRole('button', { name: /Hiện chỉ số thị trường/i });
    expect(showButton).toBeInTheDocument();

    // Re-expand
    fireEvent.click(showButton);
    expect(screen.getByTestId('market-ticker-bar')).toBeInTheDocument();
  });

  it('remembers preference from localStorage when initially hidden', () => {
    localStorage.setItem('market_ticker_visible', 'false');
    renderComponent();

    expect(screen.queryByTestId('market-ticker-bar')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hiện chỉ số thị trường/i })).toBeInTheDocument();
  });
});
