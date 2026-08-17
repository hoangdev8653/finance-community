'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SearchBar } from '@/components/search/SearchBar';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                Finance Pulse
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground -mt-1">
                Editorial & Community
              </span>
            </div>
          </Link>
        </div>

        {/* Center Search Input Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <IconButton
            variant="ghost"
            size="sm"
            label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </IconButton>

          {/* Notification Bell (for authenticated users) */}
          {!isLoading && isAuthenticated && <NotificationBell />}

          {/* Auth State Control */}
          {!isLoading && isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
