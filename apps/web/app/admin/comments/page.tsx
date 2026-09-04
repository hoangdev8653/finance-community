import { Metadata } from 'next';
import { AdminCommentsTable } from '@/components/admin/AdminCommentsTable';

export const metadata: Metadata = {
  title: 'Quản Lý Bình Luận | Finance Pulse Admin',
  description: 'Quản lý, kiểm duyệt và điều độ bình luận trong hệ thống.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCommentsPage() {
  return <AdminCommentsTable />;
}
