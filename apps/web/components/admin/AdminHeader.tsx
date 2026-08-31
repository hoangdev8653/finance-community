'use client';

import { Bell, Moon, Search, Sun } from 'lucide-react';
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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden w-[208px] shrink-0 items-center gap-2.5 lg:flex"><img src="/images/logo.png" alt="MorningView" className="h-9 w-9 object-contain" /><div className="min-w-0"><p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-primary">MorningView</p><p className="truncate text-xs text-muted-foreground">Admin workspace</p></div></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-9 w-48 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs text-muted-foreground md:flex"><Search className="h-3.5 w-3.5" /><span>Tìm kiếm...</span><span className="ml-auto text-[10px]">Ctrl K</span></div>
        {isAuthenticated && <button type="button" aria-label="Thông báo" className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>}
        <IconButton
          label={t('common.toggleTheme')}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
        </IconButton>
        {!isLoading && isAuthenticated && <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : (user?.displayName || user?.username || 'A').slice(0, 1).toUpperCase()}</div><div className="hidden leading-tight lg:block"><p className="text-xs font-semibold text-foreground">{user?.displayName && user.displayName !== 'Admin' ? user.displayName : (user?.username || 'Quản trị viên')}</p><p className="text-[10px] text-muted-foreground">Quản trị viên</p></div></div>}
      </div>
    </header>
  );
}
