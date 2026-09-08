import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountSettingsView } from '../../components/settings/AccountSettingsView';
import { useAuth } from '@/lib/auth/AuthContext';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AccountSettingsView', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'usr-1',
        email: 'investor@brewseven.vn',
        username: 'investor',
        displayName: 'Nhà Đầu Tư',
        roles: ['MEMBER'],
        status: 'ACTIVE',
      },
      isAuthenticated: true,
      isLoading: false,
    } as any);
  });

  it('renders profile tab with user information', () => {
    render(<AccountSettingsView />);

    expect(screen.getByText('Hồ sơ công khai')).toBeDefined();
    expect(screen.getByText('Bảo mật & Mật khẩu')).toBeDefined();
    expect(screen.getByText('Thông báo')).toBeDefined();
    expect(screen.getByLabelText('Tên hiển thị')).toBeDefined();
    expect(screen.getByLabelText('Địa chỉ Email')).toBeDefined();
    expect(screen.getByText('Lưu thay đổi hồ sơ')).toBeDefined();
  });
});
