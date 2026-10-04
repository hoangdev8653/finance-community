import { Metadata } from 'next';
import { AuditLogsTable } from '@/components/admin/AuditLogsTable';

export const metadata: Metadata = {
  title: 'Nhật Ký Hệ Thống (Audit Logs) | Quản trị Finance Community',
  description: 'Lưu trữ bất biến, theo dõi lịch sử kiểm toán bảo mật và các hoạt động quản trị trong nền tảng.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAuditLogsPage() {
  return <AuditLogsTable />;
}
