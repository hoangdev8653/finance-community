'use client';

import Link from 'next/link';
import { Moon, ShieldCheck, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { IconButton } from '@/components/ui/IconButton';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function AdminHeader() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Finance Pulse</p>
          <p className="text-sm font-semibold text-foreground">Admin workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton
          label={t('common.toggleTheme')}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
        </IconButton>
        {!isLoading && isAuthenticated && <NotificationBell />}
      </div>
    </header>
  );
}
