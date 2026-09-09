'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CheckSquare,
  Crown,
  FileText,
  Home,
  Layers,
  MessageCircle,
  MessagesSquare,
  Settings,
  Users,
} from 'lucide-react';

const navItems = [
  { href: '/quan-tri', label: 'Tổng quan', icon: Home, exact: true },
  { href: '/quan-tri/nguoi-dung', label: 'Người dùng', icon: Users },
  { href: '/quan-tri/hoc-tap', label: 'Khóa học', icon: BookOpen },
  { href: '/quan-tri/bai-viet', label: 'Bài viết cộng đồng', icon: MessagesSquare },
  { href: '/quan-tri/danh-muc', label: 'Danh mục', icon: Layers },
  { href: '/quan-tri/nhat-ky-he-thong', label: 'Báo cáo', icon: FileText },
  { href: '/quan-tri/binh-luan', label: 'Bình luận', icon: MessageCircle },
  { href: '/quan-tri/kiem-duyet', label: 'Quản lý yêu cầu', icon: CheckSquare },
  { href: '/quan-tri/cai-dat', label: 'Cài đặt', icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href || pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-card px-4 py-6 lg:flex text-card-foreground">
      <div className="space-y-6">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3 px-2">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20">
            {/* Geometric Book Icon in Logo */}
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M12 2v20" stroke="#f97316" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-base font-bold tracking-tight text-foreground">
              Finance Community
            </h1>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Học • Chia sẻ • Phát triển
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav aria-label="Điều hướng quản trị" className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex h-11 items-center gap-3.5 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#00B074] text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  strokeWidth={active ? 2.2 : 1.9}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration Card: Admin Panel */}
      <div className="relative mt-auto overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-b from-slate-50/90 to-emerald-50/40 p-4 pt-4 dark:border-slate-800 dark:from-slate-800/60 dark:to-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Admin Panel</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Quản trị hệ thống</p>
          </div>
        </div>

        {/* 3D Stack of books & plant image matching dashboard.png */}
        <div className="mt-2 flex items-end justify-center">
          <img
            src="/images/admin-books-plant.png"
            alt="Admin Panel illustration"
            className="h-24 w-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 hover:scale-105 dark:mix-blend-normal"
          />
        </div>
      </div>
    </aside>
  );
}
