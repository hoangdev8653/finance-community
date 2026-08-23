import React from 'react';
import { Metadata } from 'next';
import { PostModerationTable } from '@/components/admin/PostModerationTable';

export const metadata: Metadata = {
  title: 'Post Moderation | Finance Pulse Admin',
  description: 'Review and approve or reject submitted posts.',
  robots: { index: false, follow: false },
};

export default function AdminModerationPage() {
  return <PostModerationTable />;
}
