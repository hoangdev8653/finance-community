'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronDown, FileCheck2, FileSearch, Flag, FolderTree, LayoutDashboard, Layers3, MessageSquare, ShieldAlert, Sliders, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

const groups = ['Không gian làm việc', 'Nội dung', 'Cộng đồng', 'Phân loại nội dung', 'Quản trị'] as const;
const links = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true, group: groups[0] },
  { href: '/admin/posts', label: 'Bài học', icon: BookOpen, exact: true, group: groups[1] },
  { href: '/admin/learning', label: 'Duyệt bài học', icon: FileCheck2, exact: true, group: groups[1] },
  { href: '/admin/learning/create', label: 'Tạo bài học', icon: FileCheck2, exact: true, group: groups[1] },
  { href: '/admin/learning/paths', label: 'Series', icon: Layers3, exact: true, group: groups[1] },
  { href: '/admin/moderation', label: 'Bài viết cộng đồng', icon: MessageSquare, group: groups[2] },
  { href: '/moderation', label: 'Hàng chờ báo cáo', icon: ShieldAlert, group: groups[2] },
  { href: '/admin/users', label: 'Người dùng', icon: Users, group: groups[2] },
  { href: '/admin/learning/categories', label: 'Danh mục', icon: FolderTree, exact: true, group: groups[3] },
  { href: '/admin/audit-logs', label: 'Báo cáo', icon: FileSearch, group: groups[4] },
  { href: '/admin/feature-flags', label: 'Tính năng', icon: Flag, group: groups[4] },
  { href: '/admin/settings', label: 'Cấu hình', icon: Sliders, group: groups[4] },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const active = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const initials = (user?.displayName || user?.username || 'A').slice(0, 2).toUpperCase();

  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] shrink-0 flex-col overflow-hidden border-r border-[#e8edf0] bg-white px-4 py-5 lg:flex">
    <div className="flex items-center gap-2.5 px-1"><img src="/images/logo.png" alt="Finance Community" className="h-8 w-8 object-contain" /><div className="min-w-0"><p className="truncate font-heading text-sm font-semibold text-slate-900">Finance Community</p><p className="truncate text-xs text-slate-500">Admin Dashboard</p></div></div>
    <nav aria-label="Điều hướng quản trị" className="mt-8 flex-1 space-y-4 overflow-y-auto pr-1">{groups.map(group => <div key={group} className="space-y-1">{group !== groups[0] && <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{group}</p>}{links.filter(link => link.group === group).map(link => { const Icon = link.icon; const isActive = active(link.href, 'exact' in link && link.exact); return <Link key={`${link.href}-${link.label}`} href={link.href} className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 ${isActive ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>{isActive && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-emerald-600" />}<Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />{link.label}</Link>; })}</div>)}</nav>
    <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 p-3"><div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">{user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{user?.displayName || user?.username || 'Quản trị viên'}</p><p className="text-[11px] text-slate-500">Quản trị viên</p></div><ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" /></div>
  </aside>;
}
