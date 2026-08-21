'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Flag,
  Sliders,
  FileSearch,
  FolderTree,
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Post Moderation', icon: FileCheck2 },
  { href: '/admin/users', label: 'User Governance', icon: Users },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/settings', label: 'System Settings', icon: Sliders },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileSearch },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Admin Navigation"
      className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border text-xs font-mono"
    >
      {ADMIN_LINKS.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href, link.exact);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
              active
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
