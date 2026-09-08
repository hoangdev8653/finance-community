import React from 'react';
import { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Bảng Điều Khiển Quản Trị Hệ Thống | Finance Community',
  description: 'Quản trị nền tảng, học tập, bài viết cộng đồng và số liệu hoạt động.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-light-mode min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <AdminGuard>
        <AdminNav />
        <div className="lg:pl-[256px]">
          <AdminHeader />
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </AdminGuard>
    </div>
  );
}
