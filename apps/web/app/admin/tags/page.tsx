import { Metadata } from 'next';
import { AdminTagsTable } from '@/components/admin/AdminTagsTable';

export const metadata: Metadata = {
  title: 'Quản Lý Thẻ (Tags) | Finance Pulse Admin',
  description: 'Quản lý toàn bộ thẻ phân loại nội dung trong hệ thống.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminTagsPage() {
  return <AdminTagsTable />;
}
