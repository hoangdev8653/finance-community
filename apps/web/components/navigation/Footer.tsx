'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Coins,
  Globe,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const marketLinks = [
  {
    href: '/posts?tag=corporate-finance',
    label: 'Tài chính Việt Nam & Doanh nghiệp',
    icon: Building2,
    className: 'text-amber-500',
  },
  {
    href: '/posts?tag=macroeconomics',
    label: 'Tài chính Quốc tế & Vĩ mô Fed',
    icon: Globe,
    className: 'text-sky-500',
  },
  {
    href: '/posts?tag=banking-nims',
    label: 'Ngành Ngân hàng & Tín dụng',
    icon: Coins,
    className: 'text-emerald-500',
  },
  {
    href: '/series',
    label: 'Giáo trình & Khóa học Phân tích',
    icon: BookOpen,
    className: 'text-indigo-500',
  },
];

const learningLinks = [
  { href: '/series', label: 'Chuỗi bài Series', icon: BookOpen },
  { href: '/series', label: 'Đọc hiểu BCTC' },
  { href: '/series', label: 'Mô hình DCF & Định giá' },
  { href: '/dashboard', label: 'Không gian làm việc' },
];

const policyLinks = [
  { href: '/terms', label: 'Điều khoản sử dụng' },
  { href: '/privacy', label: 'Chính sách bảo mật' },
  { href: '/contact', label: 'Liên hệ Tòa soạn' },
];

export function Footer() {
  return (
    <footer className="mt-14 w-full border-t border-slate-200 bg-slate-50/95 text-slate-600 dark:border-slate-800 dark:bg-[#070d1c] dark:text-slate-400">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-3 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="MorningView"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold leading-none tracking-tight text-slate-900 transition-colors group-hover:text-teal-600 dark:text-slate-100 dark:group-hover:text-teal-400">
                  Morning<span className="text-teal-600 dark:text-teal-400">View</span>
                </span>
                <span className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Biên tập & Phân tích thị trường
                </span>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Nền tảng tri thức và phân tích tài chính độc lập, cung cấp góc nhìn về vĩ mô,
              định giá doanh nghiệp, thị trường chứng khoán, vàng và các chuỗi bài học đầu tư.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Chuẩn mực biên tập & kiểm định</span>
            </div>
          </div>

          <nav className="space-y-3 lg:col-span-3" aria-label="Chuyên mục phân tích">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Chuyên mục phân tích
            </h3>
            <ul className="space-y-2.5 text-sm">
              {marketLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <Icon className={`h-3.5 w-3.5 ${item.className}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav className="space-y-3 lg:col-span-2" aria-label="Học tập và series">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Học tập & Series
            </h3>
            <ul className="space-y-2.5 text-sm">
              {learningLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={`${item.href}-${item.label}`}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 text-emerald-500" />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-3 lg:col-span-3">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Bản tin sáng 60s
            </h3>
            <p className="max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Nhận tóm tắt diễn biến chứng khoán, giá vàng và vĩ mô gửi đến email lúc 8h sáng mỗi ngày.
            </p>
            <form onSubmit={(event) => event.preventDefault()} className="pt-1">
              <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="h-9 w-full bg-transparent px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="h-9 shrink-0 bg-slate-900 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  aria-label="Đăng ký bản tin sáng"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xs">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">
              Tuyên bố miễn trừ trách nhiệm:
            </strong>{' '}
            Thông tin và bài phân tích trên Finance Pulse chỉ nhằm mục đích tham khảo, không phải
            lời khuyên hay khuyến nghị đầu tư. Độc giả tự cân nhắc và chịu trách nhiệm với quyết định của mình.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800/80 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500 sm:flex-row">
          <div>
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-bold text-slate-700 dark:text-slate-300">Finance Pulse</span>.
            {' '}Bản quyền thuộc về Ban Biên Tập.
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Chính sách">
            {policyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-slate-900 dark:hover:text-slate-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
