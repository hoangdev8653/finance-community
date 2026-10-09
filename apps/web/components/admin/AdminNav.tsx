'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/lib/constants/brand';
import {
  BookOpen,
  Compass,
  CheckSquare,
  Crown,
  FileText,
  Home,
  Layers,
  Map,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/quan-tri', label: 'Tổng quan', icon: Home, exact: true },
      { href: '/quan-tri/nguoi-dung', label: 'Người dùng', icon: Users },
    ],
  },
  {
    label: 'HỌC TẬP',
    items: [
      { href: '/quan-tri/hoc-tap', label: 'Bài học', icon: BookOpen, exact: true },
      { href: '/quan-tri/hoc-tap/lo-trinh', label: 'Khóa học & Lộ trình', icon: Map },
    ],
  },
  {
    label: 'CỘNG ĐỒNG',
    items: [
      { href: '/quan-tri/bai-viet', label: 'Bài viết cộng đồng', icon: FileText },
      { href: '/quan-tri/kiem-duyet', label: 'Kiểm duyệt', icon: CheckSquare },
    ],
  },
  {
    label: 'PHÂN LOẠI',
    items: [
      { href: '/quan-tri/linh-vuc', label: 'Lĩnh vực', icon: Compass },
      { href: '/quan-tri/danh-muc', label: 'Danh mục', icon: Layers },
      { href: '/quan-tri/the', label: 'Thẻ', icon: Tags },
    ],
  },
  {
    label: 'HỆ THỐNG',
    items: [
      { href: '/quan-tri/nhat-ky-he-thong', label: 'Nhật ký hệ thống', icon: FileText },
      { href: '/quan-tri/cai-dat', label: 'Cài đặt', icon: Settings },
    ],
  },
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-card px-4 py-6 text-card-foreground shadow-[1px_0_10px_rgba(15,23,42,0.025)] transition-[border-color,box-shadow] duration-200 dark:border-slate-800/70 lg:flex">
      <div className="space-y-6">
        {/* Brand Logo & Slogan (Centered) */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          <Link
            href="/"
            title={`${BRAND.name} — Quay lại trang chủ`}
            className="flex flex-col items-center group transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-12 w-[180px] items-center justify-center overflow-hidden">
              <Image
                src="/images/logo.png"
                alt={BRAND.name}
                width={1953}
                height={805}
                className="h-full w-full object-contain object-center transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
            <p className="mt-1 text-[11px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
              Học • Chia sẻ • Phát triển
            </p>
          </Link>
        </div>

        {/* Navigation List */}
        <nav aria-label="Điều hướng quản trị" className="space-y-1 pt-2">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label || 'main'} className="space-y-0.5">
              {group.label && (
                <p className={`px-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 dark:text-slate-500 ${groupIndex > 0 ? 'pb-0.5 pt-0.5' : ''}`}>
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex h-10 items-center gap-3 rounded-[8px] px-3.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[#00B074] text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                      strokeWidth={active ? 2.2 : 1.9}
                      aria-hidden={true}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto pb-1 pt-5">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Crown className="h-4 w-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{BRAND.name} Admin</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Quản trị hệ thống</p>
          </div>
        </div>
        <div className="mt-1 flex items-end justify-center">
          <img
            src="/images/admin-books-plant.png"
            alt="Admin Panel illustration"
            className="h-28 w-[128%] max-w-none object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 hover:scale-105 dark:mix-blend-normal"
          />
        </div>
      </div>
    </aside>
  );
}
