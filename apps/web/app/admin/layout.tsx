import React from 'react';
import { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Admin & Governance Console | Finance Pulse',
  description: 'Platform administration, security audit logs, and runtime governance console.',
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
    <div className="min-h-[calc(100vh-72px)] bg-background">
      <AdminGuard>
        <div className="min-h-[calc(100vh-72px)]">
          <AdminNav />
          <main className="min-w-0 px-4 py-6 sm:px-6 lg:pl-[280px] lg:pr-8 xl:pr-10">{children}</main>
        </div>
      </AdminGuard>
    </div>
  );
}
