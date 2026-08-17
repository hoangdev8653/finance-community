import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { authService } from '@/lib/auth/auth-service';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

  it('renders email, password inputs and sign-in button', () => {
    renderComponent();

    expect(screen.getByLabelText(/Email address/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeDefined();
  });

  it('displays client-side validation errors when submitted empty', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeDefined();
      expect(screen.getByText(/Password is required/i)).toBeDefined();
    });
  });

  it('displays backend 401 credential error message upon invalid login', async () => {
    vi.spyOn(authService, 'login').mockRejectedValueOnce({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password credentials.',
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'analyst@finance.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid email or password credentials/i)
      ).toBeDefined();
    });
  });
});
