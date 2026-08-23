import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '@/components/navigation/Header';
import { AuthProvider } from '@/lib/auth/AuthContext';

describe('Header Component', () => {
  it('renders brand logo link with Finance Pulse label', () => {
    render(
      <AuthProvider>
        <Header />
      </AuthProvider>
    );
    expect(screen.getByRole('link', { name: /Finance Pulse/i })).toBeInTheDocument();
  });
});
