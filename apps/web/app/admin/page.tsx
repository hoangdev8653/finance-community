'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAdminOverview, useAuditLogs } from '@/lib/admin/use-admin';
import { AdminUserGrowthChart } from '@/components/admin/AdminUserGrowthChart';
import { AdminContentTrendChart } from '@/components/admin/AdminContentTrendChart';

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

  const overviewData = overviewQuery.data;
  const openReports = overviewData?.openReports;
  const reviewQueue = overviewData?.reviewQueue;
  const activeUsers = overviewData?.activeUsers;
  const totalPosts = overviewData?.totalPosts;
  const auditLogs = auditQuery.data?.data ?? [];

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-7 pb-8">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Operations center
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Platform Command Center
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Monitor real-time user acquisition, editorial velocity, and governance logs across the community.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/70" />
              All systems operational
            </span>
            <span className="hidden rounded-lg border border-border px-3 py-2 sm:inline-flex">
              Live workspace
            </span>
          </div>
        </div>
      </section>

      {/* 2. Top Metric Cards */}
      <section aria-labelledby="overview-metrics">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="overview-metrics" className="text-sm font-semibold text-foreground">
            Today at a glance
          </h2>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, helper, href, Icon, accent]) => {
            const liveValue =
              label === 'Review queue'
                ? reviewQueue
                : label === 'Open reports'
                ? openReports
                : label === 'Active users'
                ? activeUsers
                : label === 'Total posts'
                ? totalPosts
                : value;

            return (
              <Link
                key={label}
                href={href}
                className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between">
                  <span className={`rounded-lg bg-background p-2 ${accent}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4 text-2xl font-bold tracking-tight text-foreground font-heading">
                  {isLoading ? '…' : liveValue}
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Dedicated Analytics Charts (Separated User and Content Charts) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth & Demographics Chart */}
        <AdminUserGrowthChart
          series={overviewData?.userGrowthSeries}
          statusBreakdown={overviewData?.userStatusBreakdown}
          totalActiveUsers={activeUsers}
          isLoading={overviewQuery.isLoading}
        />

        {/* Editorial & Content Pipeline Chart */}
        <AdminContentTrendChart
          series={overviewData?.postGrowthSeries}
          postStatusBreakdown={overviewData?.postStatusBreakdown}
          totalPosts={totalPosts}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      {/* 4. Recent Governance Activity Table */}
      <section
        aria-labelledby="recent-activity"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 id="recent-activity" className="text-base font-semibold text-foreground">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest governance events recorded by the API.
            </p>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4 font-medium">Time</th>
                <th className="pb-3 pr-4 font-medium">Actor</th>
                <th className="pb-3 pr-4 font-medium">Action</th>
                <th className="pb-3 pr-4 font-medium">Entity</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading recent activity...
                  </td>
                </tr>
              ) : auditQuery.isError ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-rose-400">
                    Unable to load audit activity.
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No audit activity recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const time = log.createdAt ?? log.created_at;
                  const action = log.action ?? '';
                  const entityType = log.entityType ?? log.entity_type;
                  const entityId = log.entityId ?? log.entity_id;

                  return (
                    <tr key={log.id} className="group">
                      <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                        {formatDate(time)}
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {log.actorEmail ?? log.actorId ?? 'System'}
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">{action}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {entityType}
                        {entityId ? ` · ${entityId.slice(0, 8)}` : ''}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-2 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Recorded
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

