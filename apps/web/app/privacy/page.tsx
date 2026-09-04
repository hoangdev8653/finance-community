import React from 'react';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Cách MorningView thu thập, sử dụng và bảo vệ dữ liệu người dùng.',
};

const sections = [
  {
    title: '1. Dữ liệu chúng tôi thu thập',
    body: 'MorningView có thể thu thập thông tin tài khoản, email, hồ sơ công khai, nội dung bạn đăng tải, lịch sử tương tác cơ bản và dữ liệu kỹ thuật cần thiết để vận hành nền tảng.',
  },
  {
    title: '2. Mục đích sử dụng',
    body: 'Dữ liệu được dùng để xác thực tài khoản, cá nhân hóa trải nghiệm, vận hành tính năng cộng đồng, gửi thông báo, cải thiện chất lượng nội dung và bảo vệ hệ thống khỏi hành vi lạm dụng.',
  },
  {
    title: '3. Bản tin email',
    body: 'Nếu đăng ký nhận bản tin, email của bạn chỉ được dùng để gửi các cập nhật liên quan đến MorningView. Bạn có thể yêu cầu ngừng nhận bản tin bất cứ lúc nào khi tính năng hủy đăng ký được cung cấp.',
  },
  {
    title: '4. Chia sẻ dữ liệu',
    body: 'MorningView không bán dữ liệu cá nhân của người dùng. Dữ liệu chỉ được chia sẻ khi cần thiết cho vận hành dịch vụ, tuân thủ pháp luật hoặc bảo vệ quyền lợi hợp pháp của nền tảng và cộng đồng.',
  },
  {
    title: '5. Bảo mật và lưu trữ',
    body: 'Chúng tôi áp dụng các biện pháp kỹ thuật và quy trình hợp lý để bảo vệ dữ liệu. Tuy nhiên, không có hệ thống trực tuyến nào an toàn tuyệt đối, vì vậy người dùng nên bảo vệ thông tin đăng nhập của mình.',
  },
];

export default function PrivacyPage() {
  return (
    <AppShell mainClassName="max-w-4xl">
      <div className="space-y-6">
        <PageHeader
          icon={Shield}
          label="Privacy"
          title="Chính sách bảo mật"
          subtitle="Cách MorningView xử lý dữ liệu cá nhân và bảo vệ quyền riêng tư của người dùng."
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
