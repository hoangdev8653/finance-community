import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { NotificationsCenter } from '@/components/notifications/NotificationsCenter';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Notifications | Finance Pulse',
  description: 'Manage your activity, comment replies, and community updates.',
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
