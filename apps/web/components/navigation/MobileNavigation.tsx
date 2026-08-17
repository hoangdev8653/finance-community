'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, Grid, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const mobileNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/posts', icon: Compass },
  { label: 'Series', href: '/series', icon: BookOpen },
  { label: 'Categories', href: '/categories', icon: Grid },
  { label: 'Account', href: '/login', icon: User },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-border bg-background/95 backdrop-blur-xs"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
