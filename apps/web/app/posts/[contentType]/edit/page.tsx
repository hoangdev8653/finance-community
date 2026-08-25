import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';

export const metadata: Metadata = {
  title: 'Chỉnh Sửa Bài Viết | Finance Pulse Studio',
  description: 'Chỉnh sửa bài nghiên cứu đã xuất bản hoặc bản nháp của bạn.',
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
