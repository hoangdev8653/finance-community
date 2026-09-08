import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

describe('ResetPasswordForm', () => {
  it('renders invalid link state when token is missing', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByRole('heading', { name: /Liên kết không hợp lệ/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Yêu cầu gửi lại liên kết mới/i })).toBeDefined();
  });
});
