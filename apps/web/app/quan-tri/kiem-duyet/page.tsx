import React from 'react';
import { Metadata } from 'next';
import { PostModerationTable } from '@/components/admin/PostModerationTable';

export const metadata: Metadata = {
  title: 'Kiểm Duyệt Bài Viết | MorningView Admin',
  description: 'Xem xét, phê duyệt hoặc từ chối các bài viết được gửi lên hệ thống.',
  robots: { index: false, follow: false },
};


export default function AdminModerationPage() {
  return <PostModerationTable />;
}
