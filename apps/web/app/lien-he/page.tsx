import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquareText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Liên hệ Tòa soạn',
  description: `Liên hệ đội ngũ biên tập ${BRAND.name}.`,
};

const contactItems = [
  {
    title: 'Góp ý nội dung',
    description: 'Gửi phản hồi về bài viết, dữ liệu, lỗi trình bày hoặc đề xuất chủ đề phân tích.',
    value: BRAND.emails.editorial,
  },
  {
    title: 'Hợp tác chuyên môn',
    description: 'Trao đổi về series học tập, bài phân tích chuyên sâu hoặc chương trình cộng tác.',
    value: BRAND.emails.partners,
  },
  {
    title: 'Hỗ trợ tài khoản',
    description: 'Liên hệ khi cần hỗ trợ đăng nhập, hồ sơ, bài viết hoặc quyền truy cập.',
    value: BRAND.emails.support,
  },
];

export default function ContactPage() {
  return (
    <AppShell mainClassName="max-w-5xl">
      <div className="space-y-6">
        <PageHeader
          icon={MessageSquareText}
          label="Editorial Desk"
          title="Liên hệ Tòa soạn"
          subtitle={`Gửi phản hồi, đề xuất chủ đề hoặc liên hệ hợp tác với đội ngũ ${BRAND.name}.`}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {contactItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <h2 className="font-heading text-base font-bold text-slate-950 dark:text-slate-100">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
              <Link
                href={`mailto:${item.value}`}
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {item.value}
              </Link>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
          BrewSeven ưu tiên phản hồi các vấn đề liên quan đến tính chính xác của dữ liệu,
          quyền tác giả, nội dung nhạy cảm và trải nghiệm sử dụng nền tảng.
        </div>
      </div>
    </AppShell>
  );
}
