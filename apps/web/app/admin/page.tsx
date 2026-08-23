'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight, FileCheck2, FileText, ShieldAlert, ShieldCheck, Users, Zap } from 'lucide-react';
import { useAdminOverview } from '@/lib/admin/use-admin';
import { useAuditLogs } from '@/lib/admin/use-admin';

const metrics = [
  ['Review queue', '—', 'Posts awaiting decision', '/admin/posts', FileCheck2, 'text-amber-400'],
  ['Open reports', '—', 'Community items to resolve', '/moderation', ShieldAlert, 'text-rose-400'],
  ['Active users', '—', 'Current platform accounts', '/admin/users', Users, 'text-sky-400'],
  ['Total posts', '—', 'All posts in the platform', '/posts', FileText, 'text-emerald-400'],
] as const;

export default function AdminOverviewPage() {
  const overviewQuery = useAdminOverview();
  const auditQuery = useAuditLogs({ page: 1, limit: 6 });
  const isLoading = overviewQuery.isLoading || auditQuery.isLoading;
  const openReports = overviewQuery.data?.openReports;
  const reviewQueue = overviewQuery.data?.reviewQueue;
  const activeUsers = overviewQuery.data?.activeUsers;
  const totalPosts = overviewQuery.data?.totalPosts;
  const auditLogs = auditQuery.data?.data ?? [];
  const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return <div className="space-y-7 pb-8">
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Operations center</div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Good evening, Admin.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Keep the community safe, the editorial pipeline moving, and the platform healthy from one place.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/70" />All systems operational</span><span className="hidden rounded-lg border border-border px-3 py-2 sm:inline-flex">Live workspace</span></div>
      </div>
    </section>

    <section aria-labelledby="overview-metrics"><div className="mb-3 flex items-center justify-between"><h2 id="overview-metrics" className="text-sm font-semibold text-foreground">Today at a glance</h2><span className="text-xs text-muted-foreground">Updated just now</span></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, helper, href, Icon, accent]) => { const liveValue = label === 'Review queue' ? reviewQueue : label === 'Open reports' ? openReports : label === 'Active users' ? activeUsers : label === 'Total posts' ? totalPosts : value; return <Link key={label} href={href} className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-start justify-between"><span className={`rounded-lg bg-background p-2 ${accent}`}><Icon className="h-4 w-4" aria-hidden="true" /></span><ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" /></div><div className="mt-4 text-2xl font-bold tracking-tight text-foreground">{isLoading ? '…' : liveValue}</div><div className="mt-1 text-sm font-medium text-foreground">{label}</div><div className="mt-1 text-xs text-muted-foreground">{helper}</div></Link>; })}
    </div></section>

    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="activity-chart"><div className="flex items-start justify-between"><div><h2 id="activity-chart" className="text-base font-semibold text-foreground">Platform activity</h2><p className="mt-1 text-xs text-muted-foreground">Moderation, reports, and new users over the last 7 days.</p></div><span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Last 7 days</span></div><div className="mt-5 rounded-xl border border-border bg-background/50 p-3 sm:p-4"><div className="relative h-48"><div className="absolute inset-0 flex flex-col justify-between text-[10px] text-muted-foreground"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 720 190" className="ml-7 h-full w-[calc(100%-1.75rem)] overflow-visible" role="img" aria-label="Platform activity trend chart"><defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".28" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs><g className="text-border" stroke="currentColor" strokeDasharray="3 5" strokeWidth="1"><path d="M0 10H720" /><path d="M0 52H720" /><path d="M0 95H720" /><path d="M0 137H720" /><path d="M0 180H720" /></g><path d="M0 146 C45 136,65 124,103 130 S155 98,206 112 S258 66,308 86 S355 82,412 94 S463 44,515 61 S570 52,615 70 S670 35,720 43 L720 180 L0 180Z" fill="url(#activityFill)" className="text-primary" /><path d="M0 146 C45 136,65 124,103 130 S155 98,206 112 S258 66,308 86 S355 82,412 94 S463 44,515 61 S570 52,615 70 S670 35,720 43" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" className="text-primary" /><circle cx="720" cy="43" r="5" fill="currentColor" className="text-primary" /></svg></div><div className="ml-7 mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-primary" />Total activity</span><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-400" />Review load +18%</span></div></div></section>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="system-health"><div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" /><div className="relative flex items-center justify-between"><h2 id="system-health" className="text-base font-semibold text-foreground">System health</h2><CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" /></div><div className="relative mx-auto my-4 flex h-32 w-32 items-center justify-center rounded-full border border-primary/30 bg-primary/5 shadow-[0_0_45px_rgba(20,184,166,0.15)] [transform:perspective(500px)_rotateX(12deg)]"><div className="absolute inset-3 rounded-full border border-primary/20" /><div className="absolute inset-6 rounded-full border border-primary/30" /><div className="text-center [transform:perspective(500px)_rotateX(-12deg)]"><div className="text-2xl font-bold text-primary">99.9%</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Uptime</div></div></div><div className="relative space-y-3">{['API service', 'Database', 'Authentication'].map(service => <div key={service} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><span className="text-xs text-muted-foreground">{service}</span><span className="inline-flex items-center gap-2 text-[11px] font-medium text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Operational</span></div>)}</div><Link href="/admin/audit-logs" className="relative mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">View audit activity <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></section>
    </div>

      <section aria-labelledby="recent-activity" className="rounded-2xl border border-border bg-surface p-5 sm:p-6"><div className="mb-4 flex items-end justify-between"><div><h2 id="recent-activity" className="text-base font-semibold text-foreground">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">Latest governance events recorded by the API.</p></div><Link href="/admin/audit-logs" className="text-xs font-semibold text-primary hover:underline">View all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="border-b border-border text-muted-foreground"><tr><th className="pb-3 pr-4 font-medium">Time</th><th className="pb-3 pr-4 font-medium">Actor</th><th className="pb-3 pr-4 font-medium">Action</th><th className="pb-3 pr-4 font-medium">Entity</th><th className="pb-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-border">{auditQuery.isLoading ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading recent activity...</td></tr> : auditQuery.isError ? <tr><td colSpan={5} className="py-8 text-center text-rose-400">Unable to load audit activity.</td></tr> : auditLogs.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No audit activity recorded yet.</td></tr> : auditLogs.map(log => { const time = log.createdAt ?? log.created_at; const action = log.action ?? ''; const entityType = log.entityType ?? log.entity_type; const entityId = log.entityId ?? log.entity_id; return <tr key={log.id} className="group"><td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatDate(time)}</td><td className="py-3 pr-4 text-foreground">{log.actorEmail ?? log.actorId ?? 'System'}</td><td className="py-3 pr-4 font-medium text-foreground">{action}</td><td className="py-3 pr-4 text-muted-foreground">{entityType}{entityId ? ` · ${entityId.slice(0, 8)}` : ''}</td><td className="py-3"><span className="inline-flex items-center gap-2 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Recorded</span></td></tr>; })}</tbody></table></div></section>
  </div>;
}
