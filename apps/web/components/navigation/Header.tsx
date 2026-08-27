'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';
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
    href: '/series',
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
    href: '/categories/personal-finance',
    icon: Wallet,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
];

export function Header() {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-[#253044] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            title="MorningView"
            aria-label="MorningView"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.png"
                alt="MorningView"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            <span className="font-heading text-xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 hidden sm:inline-block">
              Morning<span className="text-teal-600 dark:text-teal-400">View</span>
            </span>
          </Link>
        </div>

        {/* 2. Center: Top Horizontal Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto px-6">
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
            <Home className={cn('h-4.5 w-4.5 transition-colors', pathname === '/' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300 group-hover:text-teal-700')} />
            <span>{t('navigation.home')}</span>
            {pathname === '/' && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
            )}
          </Link>

          {/* Khám phá */}
          <Link
            href="/posts"
            className={cn(
              'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/posts') && pathname !== '/posts/series'
                ? 'text-teal-800 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
            )}
          >
            <Compass className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-slate-200" />
            <span>{t('navigation.explore')}</span>
            {pathname.startsWith('/posts') && pathname !== '/posts/series' && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
            )}
          </Link>

          {/* Chuỗi bài Series */}
          <Link
            href="/series"
            className={cn(
              'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/series')
                ? 'text-teal-800 dark:text-teal-400'
                : 'text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-white'
            )}
          >
            <BookOpen className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-slate-200" />
            <span>{t('navigation.series')}</span>
            {pathname.startsWith('/series') && (
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
              <LayoutGrid className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-slate-200" />
              <span>{t('navigation.categories')}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isCategoryOpen && 'rotate-180 text-teal-600')} />

              {(isCategoryOpen || pathname.startsWith('/categories')) && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
              )}
            </button>

            {/* Dropdown Popover Menu */}
            {isCategoryOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[520px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
            href="/dashboard"
            className={cn(
                'relative flex items-center gap-2 py-2 text-sm font-bold transition-all duration-150 whitespace-nowrap group',
              pathname.startsWith('/dashboard')
                ? 'text-teal-700 dark:text-teal-400 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            )}
          >
            <Folder className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
            <span>{t('navigation.workspace')}</span>
            {pathname.startsWith('/dashboard') && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-teal-500" />
            )}
          </Link>
        </nav>

        {/* 3. Right: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <IconButton
            variant="ghost"
            size="md"
            label={t('common.toggleTheme')}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-slate-300 hover:text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-600 hover:text-slate-950 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </IconButton>

          {/* Notification Bell */}
          {!isLoading && isAuthenticated ? (
            <NotificationBell />
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('common.notifications')}
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Auth State: User Menu or Sign-in button */}
          {!isLoading && isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center ml-1">
              <Button
                variant="primary"
                size="sm"
                asChild
                className="rounded-lg font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
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
