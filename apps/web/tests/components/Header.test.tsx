import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/navigation/Header';
import { AuthProvider } from '@/lib/auth/AuthContext';

describe('Header Component', () => {
  it('renders brand logo link with MorningView label', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </QueryClientProvider>
    );
    expect(screen.getByRole('link', { name: /MorningView/i })).toBeInTheDocument();
  });
});
