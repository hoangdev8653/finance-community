import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

const columns = [
  {
    title: 'Học tập',
    links: [
      ['Tất cả khóa học', '/khoa-hoc'],
      ['Lộ trình học', '/lo-trinh-hoc'],
      ['Bài học', '/bai-viet/khoa-hoc'],
      ['Công cụ tài chính', '/cong-cu'],
    ],
  },
  {
    title: 'Cộng đồng',
    links: [
      ['Bài viết cộng đồng', '/bai-viet/cong-dong'],
      ['Khám phá bài viết', '/bai-viet'],
      ['Quy tắc cộng đồng', '/quy-tac-cong-dong'],
    ],
  },
  {
    title: 'BrewSeven',
    links: [
      ['Khám phá BrewSeven', '/kham-pha'],
      ['Giới thiệu', '/gioi-thieu'],
      ['Liên hệ', '/lien-he'],
      ['Trung tâm hỗ trợ', '/tro-giup'],
    ],
  },
  {
    title: 'Chính sách',
    links: [
      ['Điều khoản sử dụng', '/dieu-khoan'],
      ['Chính sách bảo mật', '/chinh-sach-bao-mat'],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-12 border-t border-emerald-100 bg-[#f8fbfa] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.7fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <Link href="/" className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" aria-label={`${BRAND.name} — Trang chủ`}>
              <Image src="/images/logo.png" alt={BRAND.name} width={1953} height={805} className="h-10 w-[150px] object-contain object-left" />
            </Link>
            <p className="mt-3 max-w-[270px] text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              {BRAND.slogan}
            </p>
            <Link href="/gioi-thieu" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
              Tìm hiểu về BrewSeven <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3.5">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-300 dark:hover:text-emerald-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-emerald-100 bg-[#f3f8f6] dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-4 text-sm font-medium text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 dark:text-slate-300">
          <span>© {new Date().getFullYear()} {BRAND.name}. Bảo lưu mọi quyền.</span>
          <span className="inline-flex items-center gap-1">Phát triển cùng <BookOpen aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> mỗi ngày</span>
        </div>
      </div>
    </footer>
  );
}
