import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('renders email input, submit button, and back to login link', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeDefined();
    expect(screen.getByLabelText(/Địa chỉ email/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Gửi hướng dẫn khôi phục/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Quay lại Đăng nhập/i })).toBeDefined();
  });
});
