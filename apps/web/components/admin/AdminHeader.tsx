'use client';

import { Bell, Moon, Search, Sun, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { IconButton } from '@/components/ui/IconButton';
import { ADMIN_LINKS } from './AdminNav';

export function AdminHeader() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close drawer upon route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            aria-label={isMobileNavOpen ? 'Đóng menu quản trị' : 'Mở menu quản trị'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden cursor-pointer"
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Logo */}
          <div className="hidden w-[208px] shrink-0 items-center gap-2.5 lg:flex">
            <img src="/images/logo.png" alt="MorningView" className="h-9 w-9 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-primary">MorningView</p>
              <p className="truncate text-xs font-medium text-muted-foreground">Admin Workspace</p>
            </div>
          </div>

          {/* Mobile Logo */}
          <Link href="/admin" className="flex items-center gap-2 lg:hidden">
            <img src="/images/logo.png" alt="MorningView" className="h-8 w-8 object-contain" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-9 w-52 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs text-muted-foreground md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Tìm kiếm...</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground/80">Ctrl K</span>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              aria-label="Thông báo"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
          )}

          <IconButton
            label={t('common.toggleTheme')}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
          </IconButton>

          {!isLoading && isAuthenticated && (
            <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.displayName || user?.username || 'A').slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="hidden leading-tight lg:block">
                <p className="text-xs font-semibold text-foreground">
                  {user?.displayName && user.displayName !== 'Admin' ? user.displayName : (user?.username || 'Quản trị viên')}
                </p>
                <p className="text-[10px] text-muted-foreground">Quản trị viên</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop & Sheet */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <aside className="relative flex w-72 max-w-[80vw] flex-col overflow-y-auto border-r border-border bg-background p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2">
                <img src="/images/logo.png" alt="MorningView" className="h-8 w-8 object-contain" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Điều hướng quản trị di động" className="space-y-4">
              {(['Không gian làm việc', 'Nội dung', 'Cộng đồng', 'Phân loại nội dung', 'Quản trị'] as const).map((group) => (
                <div key={group} className="space-y-1">
                  {group !== 'Không gian làm việc' && (
                    <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {group}
                    </p>
                  )}
                  {ADMIN_LINKS.filter((link) => link.group === group).map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href, link.exact);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary/10 font-bold text-primary'
                            : 'text-foreground/75 hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        {active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />}
                        <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2.25} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
