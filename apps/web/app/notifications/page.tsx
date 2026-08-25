import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { NotificationsCenter } from '@/components/notifications/NotificationsCenter';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Trung Tâm Thông Báo | Finance Pulse',
  description: 'Quản lý các hoạt động, phản hồi bình luận và cập nhật mới nhất từ cộng đồng.',
  robots: {
    index: false,
    follow: false,
  },
};


export default function NotificationsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <NotificationsCenter />
      </AppShell>
    </AuthGuard>
  );
}
