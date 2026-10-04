import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  HelpCircle,
  Mail,
  MessageSquareText,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Liên hệ tòa soạn',
  description: `Liên hệ đội ngũ biên tập ${BRAND.name}.`,
};

const contactItems = [
  {
    icon: BookOpen,
    title: 'Góp ý nội dung',
    description: 'Gửi phản hồi về bài viết, dữ liệu, lộ trình bài học hoặc đề xuất chủ đề phân tích.',
    value: BRAND.emails.editorial,
  },
  {
    icon: BriefcaseBusiness,
    title: 'Hợp tác chuyên môn',
    description: 'Trao đổi về khóa học, bài phân tích chuyên sâu hoặc chương trình cộng tác.',
    value: BRAND.emails.partners,
  },
  {
    icon: ShieldCheck,
    title: 'Hỗ trợ tài khoản',
    description: 'Liên hệ khi cần trợ giúp đăng nhập, hồ sơ, bài viết hoặc quyền truy cập.',
    value: BRAND.emails.support,
  },
];

export default function ContactPage() {
  const contactUrl = `${BRAND.fallbackUrl}/lien-he`;
  const encodedUrl = encodeURIComponent(contactUrl);
  const encodedText = encodeURIComponent(`Liên hệ với BrewSeven: ${contactUrl}`);

  return (
    <AppShell mainClassName="w-full max-w-none">
      <div className="w-full space-y-8">
        <PageHeader
          icon={MessageSquareText}
          label="Editorial Desk"
          title="Liên hệ tòa soạn"
          subtitle={`Gửi phản hồi, đề xuất chủ đề hoặc liên hệ hợp tác với đội ngũ ${BRAND.name}.`}
        />

        <section aria-label="Các đầu mối liên hệ" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="group flex min-h-[220px] flex-col rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="font-heading text-base font-bold text-slate-950 dark:text-slate-100">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
                <Link href={`mailto:${item.value}`} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-900 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300">
                  <Mail className="h-4 w-4" aria-hidden="true" />{item.value}<ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <section className="rounded-[10px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-7 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-emerald-700 text-white dark:bg-emerald-500 dark:text-slate-950"><MessageSquareText className="h-5 w-5" /></span>
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-950 dark:text-white">Bạn chưa biết nên gửi email nào?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Hãy chọn đầu mối phù hợp ở trên để phản hồi được chuyển đến nhóm phụ trách. BrewSeven ưu tiên các vấn đề về độ chính xác dữ liệu, quyền tác giả, nội dung nhạy cảm và trải nghiệm sử dụng.</p>
                <Link href="/tro-giup" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300"><HelpCircle className="h-4 w-4" /> Xem câu hỏi thường gặp <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </section>

          <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Users className="h-5 w-5" /></span><div><h2 className="font-heading text-base font-bold text-slate-950 dark:text-white">Lan tỏa BrewSeven</h2><p className="text-xs text-slate-500 dark:text-slate-400">Chia sẻ trang liên hệ với cộng đồng</p></div></div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-blue-950/30"><Share2 className="h-4 w-4" aria-hidden="true" /> Facebook</a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-sky-950/30"><Share2 className="h-4 w-4" aria-hidden="true" /> LinkedIn</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodedText}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">𝕏 Chia sẻ</a>
            </div>
            <Link href="/bai-viet/cong-dong" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">Tham gia cộng đồng <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
