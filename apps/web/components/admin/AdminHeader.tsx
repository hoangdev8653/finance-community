'use client';

import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
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

  return <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#e8edf0] bg-white/95 px-4 backdrop-blur sm:px-6 lg:pl-[260px] lg:pr-7">
    <button type="button" aria-label="Mở điều hướng quản trị" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"><Menu className="h-5 w-5" aria-hidden="true" /></button>
    <div className="flex items-center gap-2">
      <div className="hidden h-9 w-52 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 md:flex"><Search className="h-4 w-4" aria-hidden="true" /><span>Tìm kiếm...</span><span className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</span></div>
      {isAuthenticated && <button type="button" aria-label="Thông báo" className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"><Bell className="h-5 w-5" aria-hidden="true" /><span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">1</span></button>}
      <IconButton label={t('common.toggleTheme')} onClick={() => setTheme(isDark ? 'light' : 'dark')}><>{isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}</></IconButton>
      {!isLoading && isAuthenticated && <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-xs font-semibold text-white">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : (user?.displayName || user?.username || 'A').slice(0, 1).toUpperCase()}</div><div className="hidden leading-tight lg:block"><p className="text-xs font-semibold text-slate-800">{user?.displayName || user?.username || 'Quản trị viên'}</p><p className="text-[10px] text-slate-500">Quản trị viên</p></div></div>}
    </div>
  </header>;
}
