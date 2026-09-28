import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
  Landmark,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ExploreSectionNav } from '@/components/navigation/ExploreSectionNav';

export const metadata: Metadata = {
  title: 'Khám phá BrewSeven',
  description: 'Tìm nhanh khóa học, bài viết cộng đồng, chủ đề, công cụ tài chính và các trang hỗ trợ trên BrewSeven.',
};

const sections = [
  {
    id: 'hoc-tap',
    eyebrow: 'Học tập',
    title: 'Xây nền tảng kiến thức',
    description: 'Bắt đầu từ bài học ngắn, theo lộ trình phù hợp và học theo tốc độ của bạn.',
    icon: GraduationCap,
    links: [
      { title: 'Tất cả khóa học', description: 'Duyệt các khóa học đang có', href: '/khoa-hoc', icon: BookOpen },
      { title: 'Lộ trình học', description: 'Học có định hướng từng bước', href: '/lo-trinh-hoc', icon: Compass },
      { title: 'Bài học', description: 'Đọc bài học và nội dung chuyên đề', href: '/bai-viet/khoa-hoc', icon: FileText },
    ],
  },
  {
    id: 'cong-dong',
    eyebrow: 'Cộng đồng',
    title: 'Cùng nhau trao đổi',
    description: 'Đọc kinh nghiệm thực tế, đặt câu hỏi và chia sẻ góc nhìn với cộng đồng.',
    icon: Users,
    links: [
      { title: 'Bài viết cộng đồng', description: 'Thảo luận và chia sẻ kinh nghiệm', href: '/bai-viet/cong-dong', icon: MessageCircle },
      { title: 'Khám phá bài viết', description: 'Duyệt toàn bộ nội dung', href: '/bai-viet', icon: FileText },
      { title: 'Chủ đề', description: 'Tìm nội dung theo mối quan tâm', href: '/the', icon: Tags },
    ],
  },
  {
    id: 'cong-cu',
    eyebrow: 'Công cụ tài chính',
    title: 'Thử tính toán theo kế hoạch',
    description: 'Dùng các công cụ mô phỏng để hình dung khoản vay, đầu tư và định giá.',
    icon: Calculator,
    links: [
      { title: 'Lãi kép & tích lũy', description: 'Ước tính tăng trưởng tài sản', href: '/cong-cu/lai-kep', icon: TrendingUp },
      { title: 'Tính khoản vay', description: 'Xem lịch trả nợ dự kiến', href: '/cong-cu/tinh-khoan-vay', icon: Calculator },
      { title: 'Định giá cổ phiếu', description: 'Tham khảo giá trị và biên an toàn', href: '/cong-cu/dinh-gia-co-phieu', icon: Landmark },
    ],
  },
  {
    id: 'ho-tro',
    eyebrow: 'Thông tin & hỗ trợ',
    title: 'Tìm câu trả lời cần thiết',
    description: 'Tìm hiểu về BrewSeven, cách sử dụng nền tảng và các nguyên tắc cộng đồng.',
    icon: HelpCircle,
    links: [
      { title: 'Trung tâm trợ giúp', description: 'Câu hỏi thường gặp và hướng dẫn', href: '/tro-giup', icon: HelpCircle },
      { title: 'Giới thiệu', description: 'Sứ mệnh và câu chuyện BrewSeven', href: '/gioi-thieu', icon: Sparkles },
      { title: 'Liên hệ', description: 'Gửi phản hồi hoặc đề xuất hợp tác', href: '/lien-he', icon: MessageCircle },
      { title: 'Quy tắc cộng đồng', description: 'Cùng xây dựng nơi trao đổi văn minh', href: '/quy-tac-cong-dong', icon: ShieldCheck },
    ],
  },
];

export default function ExplorePage() {
  return (
    <AppShell mainClassName="w-full max-w-none">
      <div className="w-full space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-100 p-6 shadow-sm sm:p-10 dark:border-emerald-900/60 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/40">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800 dark:bg-slate-900/80 dark:text-emerald-300">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Bản đồ BrewSeven
            </div>
            <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl dark:text-white">
              Bạn muốn khám phá điều gì?
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              Từ khóa học và bài viết đến công cụ tài chính, mọi khu vực chính đều được tập hợp tại đây.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tim-kiem" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
                <Search className="h-4 w-4" aria-hidden="true" /> Tìm kiếm nội dung <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/khoa-hoc" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-emerald-700">
                <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> Xem khóa học
              </Link>
            </div>
          </div>
        </section>

        <ExploreSectionNav />

        {sections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">{section.eyebrow}</p>
                  <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{section.title}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
                </div>
                <SectionIcon className="hidden h-8 w-8 shrink-0 text-emerald-700/70 sm:block dark:text-emerald-400/70" aria-hidden="true" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {section.links.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="group flex min-h-28 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:group-hover:bg-emerald-950"><ItemIcon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-heading text-base font-bold text-slate-950 group-hover:text-emerald-800 dark:text-slate-100 dark:group-hover:text-emerald-300">{item.title}</span>
                        <span className="mt-1 block text-sm leading-5 text-slate-600 dark:text-slate-400">{item.description}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
