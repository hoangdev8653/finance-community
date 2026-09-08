'use client';

import { Bell, ChevronDown, Menu, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { IconButton } from '@/components/ui/IconButton';

export function AdminHeader() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-md transition-colors sm:px-6 lg:pl-[280px] lg:pr-8 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left Area: Toggle Hamburger + Search Bar */}
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          aria-label="Mở điều hướng quản trị"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Big Rounded Search Input matching dashboard.png */}
        <div className="relative hidden w-full max-w-[480px] sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            placeholder="Tìm kiếm người dùng, khóa học, bài viết..."
            className="h-11 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Right Area: Notification Bell & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge '5' */}
        <button
          type="button"
          aria-label="5 thông báo mới"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute -top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            5
          </span>
        </button>

        {/* Theme Toggle Button */}
        <IconButton label={t('common.toggleTheme')} onClick={() => setTheme(isDark ? 'light' : 'dark')}>
          <>{isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}</>
        </IconButton>

        {/* Admin Profile Dropdown Trigger */}
        <div className="flex cursor-pointer items-center gap-3 rounded-xl p-1 pl-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-500/30">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Admin" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-inner">
                {user?.displayName?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
              {user?.displayName || 'Admin'}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Quản trị viên
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
