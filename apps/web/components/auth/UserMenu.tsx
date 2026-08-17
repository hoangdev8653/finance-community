'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, Shield, UserCircle, LayoutDashboard, PenSquare } from 'lucide-react';
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

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
  const isModerator = user.roles.includes('MODERATOR');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="User account menu"
        >
          <Avatar
            src={user.avatarUrl}
            fallback={user.displayName || user.username}
            size="sm"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {user.displayName || user.username}
              </p>
              {isAdmin && (
                <Badge variant="secondary" className="text-[10px] uppercase py-0 px-1.5">
                  Admin
                </Badge>
              )}
              {!isAdmin && isModerator && (
                <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5">
                  Mod
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground font-mono truncate">
              @{user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/profile/${user.username}`} className="flex items-center cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Analyst Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/posts/create" className="flex items-center cursor-pointer">
            <PenSquare className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Write Analysis</span>
          </Link>
        </DropdownMenuItem>

        {(isAdmin || isModerator) && (
          <DropdownMenuItem asChild>
            <Link href="/moderation" className="flex items-center cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Moderation Desk</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
