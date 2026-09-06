import { Metadata } from 'next';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';

export const metadata: Metadata = {
  title: 'Quản Lý Bài Viết | MorningView Admin',
  description: 'Quản lý toàn bộ danh sách bài viết từ bảng điều khiển quản trị.',
  robots: {
    index: false,
    follow: false,
  },
};


export default function AdminPostsPage() {
  return <AdminPostsTable />;
}
