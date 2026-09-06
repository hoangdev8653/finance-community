import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bài Viết Đã Lưu',
  description: 'Quản lý và xem lại các bài viết, mô hình định giá và phân tích bạn đã lưu trữ.',
  noIndex: true,
  noFollow: true,
});

export default function BookmarksPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardView initialTab="bookmarks" />
      </AppShell>
    </AuthGuard>
  );
}
