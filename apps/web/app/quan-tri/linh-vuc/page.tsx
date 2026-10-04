import type { Metadata } from 'next';
import { DomainManagementView } from '@/components/admin/DomainManagementView';

export const metadata: Metadata = {
  title: 'Quản lý Lĩnh vực (Domains) | Quản trị Finance Community',
  description: 'Quản lý các trục lĩnh vực nội dung chính của nền tảng',
};

export default function AdminDomainsPage() {
  return <DomainManagementView />;
}
