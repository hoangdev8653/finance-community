import React from 'react';
import { Metadata } from 'next';
import { AdminModerationHub } from '@/components/admin/AdminModerationHub';

export const metadata: Metadata = {
  title: 'Trung Tâm Kiểm Duyệt & Báo Cáo | Finance Community Admin',
  description: 'Xem xét phê duyệt bài viết và xử lý báo cáo vi phạm nội dung từ cộng đồng.',
  robots: { index: false, follow: false },
};

export default function AdminModerationPage() {
  return <AdminModerationHub />;
}
