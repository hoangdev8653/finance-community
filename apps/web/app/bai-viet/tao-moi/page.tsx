import React from 'react';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';

export const metadata: Metadata = {
  title: 'Viết bài cộng đồng | BrewSeven',
  description: 'Chia sẻ kinh nghiệm, đặt câu hỏi và trao đổi kiến thức cùng cộng đồng BrewSeven.',
  robots: {
    index: false,
    follow: false,
  },
};


export default function CreatePostPage() {
  return (
    <AuthGuard>
      <PostStudio defaultContentType="COMMUNITY" allowLearningAuthoring={false} />
    </AuthGuard>
  );
}
