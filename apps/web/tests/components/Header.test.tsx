import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '@/components/navigation/Header';
import { AuthProvider } from '@/lib/auth/AuthContext';

describe('Header Component', () => {
  it('renders brand title Finance Pulse', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    expect(screen.getByText('Finance Pulse')).toBeInTheDocument();
  });
});
