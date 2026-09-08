import React from 'react';
import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <AppShell mainClassName="max-w-4xl">
        <div className="space-y-8">
          <PageHeader
            icon={Settings}
            label="Tài khoản cá nhân"
            title="Cài đặt tài khoản & Hồ sơ"
            subtitle={`Quản lý thông tin hiển thị, thay đổi mật khẩu và tùy chỉnh trải nghiệm của bạn trên ${BRAND.name}.`}
          />

          <AccountSettingsView />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
