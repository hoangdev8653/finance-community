import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bàn Làm Việc Nhà Phân Tích',
  description: 'Quản lý các ấn phẩm tài chính, theo dõi mức độ tương tác của độc giả và soạn thảo mô hình định giá.',
  noIndex: true,
  noFollow: true,
});


export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardView />
      </AppShell>
    </AuthGuard>
  );
}
