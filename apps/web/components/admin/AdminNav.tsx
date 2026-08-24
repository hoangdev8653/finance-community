'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck2, Users, Flag, Sliders, FileSearch, FolderTree, ShieldAlert, ChevronLeft, ChevronRight, PanelLeftClose } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: FileCheck2 },
  { href: '/admin/moderation', label: 'Post Moderation', icon: ShieldAlert },
  { href: '/moderation', label: 'Report Queue', icon: ShieldAlert },
  { href: '/admin/users', label: 'User Governance', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileSearch },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/settings', label: 'System Settings', icon: Sliders },
];

export function AdminNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return <aside className={`group/sidebar fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] shrink-0 flex-col overflow-hidden border-r border-border bg-background/95 py-5 transition-[width] duration-200 lg:flex ${collapsed ? 'w-[76px] px-3' : 'w-[248px] px-4'}`}>
    <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
      {!collapsed && <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Finance Pulse</p><p className="mt-1 text-xs text-muted-foreground">Admin workspace</p></div>}
      <button type="button" onClick={() => setCollapsed(value => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}>{collapsed ? <ChevronRight className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
    </div>
    <nav aria-label="Admin Navigation" className="flex-1 space-y-1">
      {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>}
      {ADMIN_LINKS.map(link => { const Icon = link.icon; const active = isActive(link.href, link.exact); return <Link key={link.href} href={link.href} title={collapsed ? link.label : undefined} className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${collapsed ? 'justify-center' : ''} ${active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-surface hover:text-foreground'}`}>{active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />}<Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />{!collapsed && <span>{link.label}</span>}</Link>; })}
    </nav>
    {!collapsed && <div className="mt-auto rounded-xl border border-border bg-surface p-3"><div className="flex items-center gap-2 text-xs font-medium text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />All systems operational</div><p className="mt-2 text-[11px] leading-4 text-muted-foreground">Last checked just now</p></div>}
  </aside>;
}
