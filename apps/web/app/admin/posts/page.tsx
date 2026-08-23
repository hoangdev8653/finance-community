import React from 'react';
import { Metadata } from 'next';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';

export const metadata: Metadata = {
  title: 'Posts | Finance Pulse Admin',
  description: 'Manage all posts from the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPostsPage() {
  return <AdminPostsTable />;
}
