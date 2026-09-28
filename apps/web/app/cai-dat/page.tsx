import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { AccountSettingsView } from '@/components/settings/AccountSettingsView';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Cài đặt tài khoản & Hồ sơ cá nhân',
  description: `Quản lý thông tin hiển thị, bảo mật mật khẩu và tùy chọn thông báo trên ${BRAND.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountSettingsPage() {
  return (
    <AuthGuard>
      <AppShell mainClassName="max-w-none">
        <AccountSettingsView />
      </AppShell>
    </AuthGuard>
  );
}
