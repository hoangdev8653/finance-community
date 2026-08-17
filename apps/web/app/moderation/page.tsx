import React from 'react';
import { Metadata } from 'next';
import { ModerationGuard } from '@/components/moderation/ModerationGuard';
import { ModerationQueueTable } from '@/components/moderation/ModerationQueueTable';

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <ModerationGuard>
        <ModerationQueueTable />
      </ModerationGuard>
    </div>
  );
}
