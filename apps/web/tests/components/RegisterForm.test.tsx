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

    expect(screen.getByLabelText(/Địa chỉ email|Email address/i)).toBeDefined();
    expect(screen.getByLabelText(/^(Tên người dùng|Username)/i)).toBeDefined();
    expect(screen.getByLabelText(/^(Mật khẩu|Password)/i)).toBeDefined();
    expect(screen.getByLabelText(/Xác nhận mật khẩu|Confirm Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Tạo tài khoản/i })).toBeDefined();
  });

  it('validates password minimum length and mismatch', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Địa chỉ email|Email address/i), {
      target: { value: 'user@finance.com' },
    });
    fireEvent.change(screen.getByLabelText(/^(Tên người dùng|Username)/i), {
      target: { value: 'valid_user' },
    });
    fireEvent.change(screen.getByLabelText(/^(Mật khẩu|Password)/i), {
      target: { value: '123' }, // short
    });
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu|Confirm Password/i), {
      target: { value: '123456' }, // mismatch
    });

    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản/i }));

    await waitFor(() => {
      expect(screen.getByText(/Mật khẩu phải có ít nhất 6 ký tự|Password must be at least 6 characters/i)).toBeDefined();
    });
  });

  it('displays field-level error when backend returns 409 conflict code', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce({
      statusCode: 409,
      code: 'USERNAME_ALREADY_EXISTS',
      message: 'Username is already taken.',
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Địa chỉ email|Email address/i), {
      target: { value: 'unique@finance.com' },
    });
    fireEvent.change(screen.getByLabelText(/^(Tên người dùng|Username)/i), {
      target: { value: 'existing_user' },
    });
    fireEvent.change(screen.getByLabelText(/^(Mật khẩu|Password)/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu|Confirm Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username is already taken\./i)).toBeDefined();
    });
  });
});
