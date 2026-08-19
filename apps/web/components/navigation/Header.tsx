'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Sun, Moon, Settings, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SearchBar } from '@/components/search/SearchBar';

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (theme === 'dark' || resolvedTheme === 'dark') : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
      <div className="w-full flex h-16 items-center justify-between px-6 lg:px-8">
        {/* Brand Logo — strictly 4pt grid aligned */}
        <div className="flex items-center gap-6 w-[256px] shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none">
                Finance Pulse
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-600 dark:text-slate-300 font-bold mt-1">
                Editorial &amp; Community
              </span>
            </div>
          </Link>
        </div>

        {/* Center Search Input Trigger */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <SearchBar />
        </div>

        {/* Right Navigation Controls — strictly integer 4pt classes */}
        <div className="flex items-center gap-2">
          {/* Settings Icon */}
          <IconButton
            variant="ghost"
            size="md"
            label="Settings"
            onClick={() => {}}
          >
            <Settings className="h-5 w-5 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors" />
          </IconButton>

          {/* Theme Toggle */}
          <IconButton
            variant="ghost"
            size="md"
            label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-slate-300 hover:text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 hover:text-slate-950 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </IconButton>

          {/* Notification Bell — always visible */}
          {!isLoading && isAuthenticated ? (
            <NotificationBell />
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
          )}

          {/* Auth State Control — strictly 4pt grid paddings */}
          {!isLoading && isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="outline" size="sm" asChild className="font-bold text-sm text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 px-4 py-2">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild className="font-bold text-sm px-5 py-2 shadow-xs bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/register">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
