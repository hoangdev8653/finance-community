import React from 'react';
import { Metadata } from 'next';
import { PostModerationTable } from '@/components/admin/PostModerationTable';

export const metadata: Metadata = {
  title: 'Post Moderation Queue | Finance Pulse Admin',
  description: 'Manage post publication states, review new articles, and enforce community content policies.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPostsPage() {
  return <PostModerationTable />;
}
