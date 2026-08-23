import React from 'react';
import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản sử dụng nền tảng Finance Pulse.',
};

const sections = [
  {
    title: '1. Phạm vi sử dụng',
    body: 'Finance Pulse cung cấp nội dung phân tích, dữ liệu tham khảo và tài liệu học tập về tài chính. Khi truy cập hoặc sử dụng nền tảng, bạn đồng ý sử dụng thông tin một cách hợp pháp, tôn trọng quyền sở hữu trí tuệ và không gây ảnh hưởng đến hoạt động của hệ thống.',
  },
  {
    title: '2. Nội dung phân tích',
    body: 'Các bài viết, nhận định và dữ liệu trên Finance Pulse chỉ phục vụ mục đích cung cấp tri thức và tham khảo. Nội dung không cấu thành lời khuyên đầu tư, khuyến nghị mua bán chứng khoán, hàng hóa, tiền mã hóa hoặc bất kỳ tài sản tài chính nào.',
  },
  {
    title: '3. Trách nhiệm của người dùng',
    body: 'Người dùng tự chịu trách nhiệm với quyết định tài chính của mình. Bạn cần tự kiểm chứng thông tin, đánh giá mức độ phù hợp với khẩu vị rủi ro cá nhân và tham khảo chuyên gia độc lập khi cần thiết.',
  },
  {
    title: '4. Tài khoản và nội dung đóng góp',
    body: 'Nếu bạn tạo tài khoản hoặc đăng nội dung, bạn chịu trách nhiệm về tính chính xác, nguồn gốc và tính hợp pháp của nội dung đó. Finance Pulse có quyền chỉnh sửa, ẩn hoặc gỡ nội dung vi phạm chuẩn mực cộng đồng hoặc quy định pháp luật.',
  },
  {
    title: '5. Thay đổi điều khoản',
    body: 'Finance Pulse có thể cập nhật điều khoản sử dụng để phản ánh thay đổi về sản phẩm, pháp lý hoặc vận hành. Phiên bản mới có hiệu lực kể từ khi được đăng tải trên nền tảng.',
  },
];

export default function TermsPage() {
  return (
    <AppShell mainClassName="max-w-4xl">
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          label="Legal"
          title="Điều khoản sử dụng"
          subtitle="Các nguyên tắc khi truy cập, đọc, đóng góp và sử dụng nội dung trên Finance Pulse."
        />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="font-heading text-base font-bold text-slate-950 dark:text-slate-100">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
