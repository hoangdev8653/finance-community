import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';

export const metadata: Metadata = {
  title: 'Edit Analysis | Finance Pulse Studio',
  description: 'Edit your published research or draft.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditPostPage() {
  return (
    <AuthGuard>
      <PostStudio />
    </AuthGuard>
  );
}
