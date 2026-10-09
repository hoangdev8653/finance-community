'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, Shield, UserCircle, LayoutDashboard, PenSquare, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface UserMenuProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserMenu({
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: UserMenuProps = {}) {
  const { user, logout } = useAuth();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
  const isModerator = user.roles.includes('MODERATOR');

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full p-0 transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          aria-label="Mở menu tài khoản"
        >
          <Avatar
            src={user.avatarUrl}
            fallback={user.displayName || user.username}
            className="h-10 w-10 text-sm shadow-xs"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="w-[min(21rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200/80 bg-white p-2.5 font-sans shadow-[0_18px_50px_rgba(15,23,42,0.16),0_4px_14px_rgba(15,23,42,0.06)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] z-50"
      >
        <DropdownMenuLabel className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 font-normal dark:border-slate-700/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar src={user.avatarUrl} fallback={user.displayName || user.username} size="md" className="ring-2 ring-white shadow-sm dark:ring-slate-700" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                  {user.displayName || user.username}
                </p>
                {isAdmin && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    Quản trị
                  </span>
                )}
                {!isAdmin && isModerator && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                    Điều hành
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                @{user.username}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />

        <div className="space-y-0.5">
          <DropdownMenuItem asChild>
            <Link
              href={`/ho-so/${encodeURIComponent(user.username)}`}
              className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800"
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:group-hover:bg-blue-900/70">
                <UserCircle className="h-4 w-4" />
              </div>
              <span>Hồ sơ cá nhân</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/bang-dieu-khien"
              className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800"
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:group-hover:bg-emerald-900/70">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Bàn làm việc tác giả</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/bai-viet/tao-moi"
              className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800"
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700 transition-colors group-hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300 dark:group-hover:bg-violet-900/70">
                <PenSquare className="h-4 w-4" />
              </div>
              <span>Viết bài cộng đồng</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/cai-dat"
              className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800"
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700">
                <Settings className="h-4 w-4" />
              </div>
              <span>Cài đặt tài khoản</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {(isAdmin || isModerator) && (
          <>
            <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-0.5">
              <div className="px-2.5 pb-1 pt-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                  Hệ thống
                </span>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href={isAdmin ? '/quan-tri' : '/quan-tri/kiem-duyet'}
                  className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800"
                >
                  <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:group-hover:bg-amber-900/70">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>{isAdmin ? 'Trang quản trị' : 'Kênh kiểm duyệt'}</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem
          onClick={logout}
          className="group flex min-h-11 items-center rounded-xl px-2.5 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:focus:bg-rose-950/40"
        >
          <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 transition-colors group-hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:group-hover:bg-rose-900/70">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
