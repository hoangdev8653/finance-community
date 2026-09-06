'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Sun,
  Moon,
  Bell,
  LogIn,
  Home,
  Compass,
  BookOpen,
  LayoutGrid,
  Folder,
  ChevronDown,
  Building2,
  Globe,
  Coins,
  BarChart3,
  Wallet,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils/cn';
import { postsService } from '@/lib/posts/posts-service';
import { useQuery } from '@tanstack/react-query';

interface CategoryDropdownItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

const CATEGORY_ITEMS: CategoryDropdownItem[] = [
  {
    title: 'Tài chính Việt Nam',
    desc: 'Vĩ mô trong nước, Doanh nghiệp niêm yết, BĐS & Ngân hàng',
    href: '/posts?tag=corporate-finance',
    icon: Building2,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Tài chính Quốc tế',
    desc: 'Chính sách Fed, Lãi suất toàn cầu, Phố Wall, Tỷ giá DXY',
    href: '/posts?tag=macroeconomics',
    icon: Globe,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'Hàng hóa & Giá Vàng',
    desc: 'Diễn biến giá vàng SJC, Dầu thô Brent, Hàng hóa chiến lược',
    href: '/posts?tag=commodities',
    icon: Coins,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    title: 'Chuỗi bài Series',
    desc: 'Cẩm nang Đọc BCTC, Định giá bài bản & Chiến lược đầu tư',
    href: '/chuoi-bai',
    icon: BookOpen,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Định giá & Phân tích',
    desc: 'Mô hình DCF, P/E, EV/EBITDA, Phân tích Báo cáo tài chính',
    href: '/categories/valuation',
    icon: BarChart3,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },
  {
    title: 'Tài chính Cá nhân',
    desc: 'Xây dựng dòng tiền tự do, Phân bổ tài sản & Quản trị rủi ro',
    href: '/categories/tai-chinh-ca-nhan',
    icon: Wallet,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [headerSearch, setHeaderSearch] = useState('');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => postsService.getDomains(),
    staleTime: 15 * 60 * 1000,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCategoryOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCategoryOpen(false);
    }, 180);
  };

  const isDark = mounted ? theme === 'dark' || resolvedTheme === 'dark' : false;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-t-[3px] border-t-slate-900 border-b border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-t-slate-700 dark:border-b-[#253044] dark:bg-[#111827]/95">
      <div className="w-full max-w-[1440px] mx-auto flex h-16 sm:h-18 items-center justify-between px-3.5 sm:px-6 lg:px-8">
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            title="Finance Community"
            aria-label="Finance Community"
            className="flex items-center gap-2 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.png"
                alt="Finance Community"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-slate-950 dark:text-slate-100 hidden sm:inline-block">
              Finance Community
            </span>
          </Link>
        </div>

        {/* 2. Center: Top Horizontal Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 xl:gap-8 mx-auto px-3 lg:px-6">
          {/* Trang chủ */}
          <Link
            href="/"
            className={cn(
              'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname === '/'
                ? 'text-teal-800 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
            )}
          >
            <Home className="hidden" aria-hidden="true" />
            <span>{t('navigation.home')}</span>
            {pathname === '/' && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
            )}
          </Link>

          {/* Khám phá */}
          <Link
            href="/chuoi-bai"
            className={cn(
              'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/chuoi-bai') || pathname.startsWith('/lo-trinh-hoc')
                ? 'text-teal-800 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
            )}
          >
            <Compass className="hidden" aria-hidden="true" />
            <span>Series</span>
            {(pathname.startsWith('/chuoi-bai') || pathname.startsWith('/lo-trinh-hoc')) && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
            )}
          </Link>

          {/* Chuỗi bài Series */}
          <Link
            href="/posts"
            className={cn(
              'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/posts')
                ? 'text-teal-800 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
            )}
          >
            <BookOpen className="hidden" aria-hidden="true" />
            <span>Bài viết cộng đồng</span>
            {pathname.startsWith('/posts') && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
            )}
          </Link>

          {/* Danh mục (Category Dropdown on Hover) */}
          <div
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              aria-expanded={isCategoryOpen}
              className={cn(
                'relative flex items-center gap-1.5 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer group',
                isCategoryOpen || pathname.startsWith('/categories')
                  ? 'text-teal-800 dark:text-teal-400'
                  : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
              )}
            >
            <LayoutGrid className="hidden" aria-hidden="true" />
              <span>{t('navigation.categories')}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isCategoryOpen && 'rotate-180 text-teal-600')} />

              {(isCategoryOpen || pathname.startsWith('/categories')) && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
              )}
            </button>

            {/* Dropdown Popover Menu */}
            {isCategoryOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[520px] max-w-[calc(100vw-2rem)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="rounded-xl border border-slate-200 dark:border-[#253044] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl p-3.5 shadow-2xl space-y-1">
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-[#253044]/80 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Chuyên mục & Phạm vi phân tích
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => setIsCategoryOpen(false)}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {domains.map((domain, index) => {
                      const Icon = [Building2, Globe, Coins, BookOpen, BarChart3, Wallet][index % 6];
                      return (
                        <Link
                          key={domain.id}
                          href={`/${encodeURIComponent(domain.slug)}`}
                          onClick={() => setIsCategoryOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group"
                        >
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border shrink-0', ['text-amber-500 bg-amber-500/10 border-amber-500/20', 'text-blue-500 bg-blue-500/10 border-blue-500/20', 'text-teal-500 bg-teal-500/10 border-teal-500/20', 'text-purple-500 bg-purple-500/10 border-purple-500/20', 'text-sky-500 bg-sky-500/10 border-sky-500/20', 'text-rose-500 bg-rose-500/10 border-rose-500/20'][index % 6])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors block truncate">
                              {domain.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {domain.description || domain.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Không gian làm việc */}
          <Link
            href="/tools"
            className={cn(
                'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/tools')
                ? 'text-teal-700 dark:text-teal-400 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            )}
          >
            <Folder className="hidden" aria-hidden="true" />
            <span>Công cụ</span>
            {pathname.startsWith('/tools') && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-500" />
            )}
          </Link>
        </nav>

        {/* 3. Right: Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Quick Search Bar (Desktop / Tablet) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (headerSearch.trim()) {
                router.push(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
              } else {
                router.push('/search');
              }
            }}
            className="hidden md:flex items-center relative"
          >
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Tìm kiếm bài học, series, chủ đề..."
              className="h-10 w-[240px] rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-foreground placeholder:font-medium placeholder:text-muted-foreground transition-colors focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </form>

          {/* Mobile Search Icon Button */}
          <Link
            href="/search"
            className="md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Tìm kiếm bài viết"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Theme Toggle */}
          <IconButton
            variant="ghost"
            size="sm"
            className="hidden"
            label={t('common.toggleTheme')}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-slate-300 hover:text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 hover:text-slate-950 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </IconButton>

          {/* Notification Bell */}
          {!isLoading && isAuthenticated ? (
            <NotificationBell />
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('common.notifications')}
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Auth State: User Menu or Sign-in button */}
          {!isLoading && isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center ml-0.5 sm:ml-1">
              <Button
                variant="primary"
                size="sm"
                asChild
                className="h-10 rounded-lg font-bold text-xs sm:text-sm px-3.5 sm:px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Link href="/login">
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t('common.signIn')}</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
