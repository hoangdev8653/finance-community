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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-transparent transition-colors hover:border-primary/15 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:hover:border-primary/25 dark:hover:bg-primary/10 cursor-pointer"
          aria-label="Mở menu tài khoản"
        >
          <Avatar
            src={user.avatarUrl}
            fallback={user.displayName || user.username}
            size="sm"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="w-80 rounded-[10px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 font-sans shadow-[0_20px_50px_rgba(15,23,42,0.18),0_4px_16px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-50"
      >
        <DropdownMenuLabel className="rounded-[10px] bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-3 font-normal">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar src={user.avatarUrl} fallback={user.displayName || user.username} size="md" className="ring-2 ring-primary/20" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Đang trực tuyến" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold leading-tight text-slate-900 dark:text-white">
                  {user.displayName || user.username}
                </p>
                {isAdmin && (
                  <span className="shrink-0 inline-flex items-center rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Quản trị
                  </span>
                )}
                {!isAdmin && isModerator && (
                  <span className="shrink-0 inline-flex items-center rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/25 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Điều hành
                  </span>
                )}
              </div>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                @{user.username}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />

        <div className="space-y-0.5">
          <DropdownMenuItem asChild>
            <Link
              href={`/ho-so/${encodeURIComponent(user.username)}`}
              className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mr-2.5 transition-transform group-hover:scale-105">
                <UserCircle className="h-4 w-4" />
              </div>
              <span>Hồ sơ cá nhân</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/bang-dieu-khien"
              className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mr-2.5 transition-transform group-hover:scale-105">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Bàn làm việc tác giả</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/bai-viet/tao-moi"
              className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 mr-2.5 transition-transform group-hover:scale-105">
                <PenSquare className="h-4 w-4" />
              </div>
              <span>Viết bài cộng đồng</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/cai-dat"
              className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 mr-2.5 transition-transform group-hover:scale-105">
                <Settings className="h-4 w-4" />
              </div>
              <span>Cài đặt tài khoản</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {(isAdmin || isModerator) && (
          <>
            <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-0.5">
              <div className="px-2.5 pt-1 pb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Hệ thống
                </span>
              </div>
              <DropdownMenuItem asChild>
                <Link
                  href={isAdmin ? '/quan-tri' : '/quan-tri/kiem-duyet'}
                  className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 mr-2.5 transition-transform group-hover:scale-105">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>{isAdmin ? 'Trang quản trị' : 'Kênh kiểm duyệt'}</span>
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem
          onClick={logout}
          className="group flex min-h-10 items-center rounded-[8px] px-2.5 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/90 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 mr-2.5 transition-transform group-hover:scale-105">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
