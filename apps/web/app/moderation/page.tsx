import React from 'react';
import { Metadata } from 'next';
import { ModerationGuard } from '@/components/moderation/ModerationGuard';
import { ModerationQueueTable } from '@/components/moderation/ModerationQueueTable';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Moderation Console | Finance Pulse',
  description: 'Community content governance and policy compliance moderation console.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ModerationPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-background">
      <AdminNav />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:pl-[280px] lg:pr-8 xl:pr-10">
        <ModerationGuard>
          <ModerationQueueTable />
        </ModerationGuard>
      </main>
    </div>
  );
}
