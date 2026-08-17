import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { authService } from '@/lib/auth/auth-service';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    );

  it('renders all required registration inputs', () => {
    renderComponent();

    expect(screen.getByLabelText(/Email address/i)).toBeDefined();
    expect(screen.getByLabelText(/^Username/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password \(min 6 characters\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDefined();
  });

  it('validates password minimum length and mismatch', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'user@finance.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Username/i), {
      target: { value: 'valid_user' },
    });
    fireEvent.change(screen.getByLabelText(/^Password \(min 6 characters\)/i), {
      target: { value: '123' }, // short
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: '123456' }, // mismatch
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeDefined();
    });
  });

  it('displays field-level error when backend returns 409 conflict code', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce({
      statusCode: 409,
      code: 'USERNAME_ALREADY_EXISTS',
      message: 'Username is already taken.',
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'unique@finance.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Username/i), {
      target: { value: 'existing_user' },
    });
    fireEvent.change(screen.getByLabelText(/^Password \(min 6 characters\)/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username is already taken\./i)).toBeDefined();
    });
  });
});
