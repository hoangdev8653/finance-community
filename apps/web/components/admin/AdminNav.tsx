'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck2, Users, Flag, Sliders, FileSearch, FolderTree, ShieldAlert, Route, MessageSquare, Tag } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true, group: 'Không gian làm việc' },
  { href: '/admin/posts', label: 'Tất cả bài học', icon: FileCheck2, exact: true, group: 'Nội dung' },
  { href: '/admin/learning', label: 'Duyệt bài học', icon: FileCheck2, exact: true, group: 'Nội dung' },
  { href: '/admin/learning/create', label: 'Tạo bài học', icon: FileCheck2, exact: true, group: 'Nội dung' },
  { href: '/admin/learning/paths', label: 'Lộ trình học', icon: Route, exact: true, group: 'Nội dung' },
  { href: '/admin/moderation', label: 'Kiểm duyệt bài viết', icon: ShieldAlert, group: 'Nội dung' },
  { href: '/moderation', label: 'Hàng chờ báo cáo', icon: ShieldAlert, group: 'Cộng đồng' },
  { href: '/admin/users', label: 'Quản lý người dùng', icon: Users, group: 'Cộng đồng' },
  { href: '/admin/comments', label: 'Quản lý bình luận', icon: MessageSquare, group: 'Cộng đồng' },
  { href: '/admin/learning/categories', label: 'Danh mục học tập', icon: FolderTree, exact: true, group: 'Phân loại nội dung' },
  { href: '/admin/tags', label: 'Quản lý thẻ', icon: Tag, group: 'Phân loại nội dung' },
  { href: '/admin/audit-logs', label: 'Nhật ký hoạt động', icon: FileSearch, group: 'Quản trị' },
  { href: '/admin/feature-flags', label: 'Tính năng hệ thống', icon: Flag, group: 'Quản trị' },
  { href: '/admin/settings', label: 'Cài đặt hệ thống', icon: Sliders, group: 'Quản trị' },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <aside className="group/sidebar fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-[248px] shrink-0 flex-col overflow-hidden border-r border-border bg-background/95 px-4 py-4 lg:flex">
    <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-4">
      {(['Không gian làm việc', 'Nội dung', 'Cộng đồng', 'Phân loại nội dung', 'Quản trị'] as const).map(group => <div key={group} className="space-y-1">
        {group !== 'Không gian làm việc' && <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{group}</p>}
        {ADMIN_LINKS.filter(link => link.group === group).map(link => { const Icon = link.icon; const active = isActive(link.href, link.exact); return <Link key={link.href} href={link.href} className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors ${active ? 'bg-primary/10 font-bold text-primary' : 'text-foreground/75 hover:bg-surface hover:text-foreground'}`}>{active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary" />}<Icon className="h-5 w-5 shrink-0" strokeWidth={2.5} />{link.label}</Link>; })}
      </div>)}
    </nav>
    <div className="mt-auto rounded-xl border border-border bg-surface p-3"><div className="flex items-center gap-2 text-xs font-medium text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />Hệ thống đang hoạt động</div><p className="mt-2 pl-4 text-[11px] text-muted-foreground">Kiểm tra lần cuối: vừa xong</p></div>
  </aside>;
}
