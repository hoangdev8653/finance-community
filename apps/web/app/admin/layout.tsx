import React from 'react';
import { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: 'Bảng Điều Khiển Quản Trị Hệ Thống | Finance Pulse Admin',
  description: 'Quản trị nền tảng, nhật ký kiểm toán bảo mật và phân quyền tài khoản.',
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
    <div className="min-h-screen bg-background">
      <AdminGuard>
        <AdminHeader />
        <div className="min-h-[calc(100vh-4rem)]">
          <AdminNav />
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:pl-[280px] lg:pr-8 xl:pr-10">{children}</main>
        </div>
      </AdminGuard>
    </div>
  );
}
