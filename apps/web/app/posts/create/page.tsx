import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';

export const metadata: Metadata = {
  title: 'Soạn Thảo Bài Viết Mới | Finance Pulse Studio',
  description: 'Biên tập và xuất bản bài nghiên cứu, nhận định thị trường tài chính chuyên nghiệp.',
  robots: {
    index: false,
    follow: false,
  },
};


export default function CreatePostPage() {
  return (
    <AuthGuard>
      <PostStudio />
    </AuthGuard>
  );
}
