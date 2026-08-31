'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { TimeSeriesPoint } from '@/types/admin';

interface AdminUserGrowthChartProps {
  series?: TimeSeriesPoint[];
  statusBreakdown?: {
    active: number;
    suspended: number;
    pending: number;
  };
  totalActiveUsers?: number;
  isLoading?: boolean;
}

export function AdminUserGrowthChart({
  series = [],
  statusBreakdown = { active: 0, suspended: 0, pending: 0 },
  totalActiveUsers = 0,
  isLoading = false,
}: AdminUserGrowthChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalNewUsers = series.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...series.map((s) => s.count), 5);

  const totalAllAccounts =
    statusBreakdown.active + statusBreakdown.suspended + statusBreakdown.pending || totalActiveUsers || 1;
  const activeRate = Math.round((statusBreakdown.active / totalAllAccounts) * 100) || 100;

  return (
    <section
      aria-labelledby="user-analytics-heading"
      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs"
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
                <Users className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2
                id="user-analytics-heading"
                className="font-heading text-lg font-extrabold text-foreground"
              >
                Tăng trưởng người dùng
              </h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Người dùng mới và trạng thái tài khoản trong 7 ngày qua.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="group inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            <span>Manage users</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Highlight Stats Row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-base text-foreground font-semibold">
              <UserPlus className="h-3.5 w-3.5 text-sky-400" />
              <span>Đăng ký 7 ngày</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
              {isLoading ? '…' : `+${totalNewUsers}`}
            </div>
            <span className="mt-0.5 block text-sm font-medium text-muted-foreground">
              {totalNewUsers > 0 ? 'Active onboardings' : 'No new sign-ups'}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tỷ lệ hoạt động</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400">
              {isLoading ? '…' : `${activeRate}%`}
            </div>
            <span className="mt-0.5 block text-sm font-medium text-muted-foreground">
              {statusBreakdown.active} active accounts
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span>Tạm khóa</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
              {isLoading ? '…' : statusBreakdown.suspended}
            </div>
            <span className="mt-0.5 block text-sm font-medium text-muted-foreground">
              Policy restricted
            </span>
          </div>
        </div>

        {/* 7-Day Real Column/Bar Chart */}
        <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-border text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Đăng ký hằng ngày</span>
            <span className="font-mono text-xs">Dữ liệu theo thời gian thực</span>
          </div>

          {series.length === 0 ? <div className="mt-4 flex h-36 items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground">Chưa có đủ dữ liệu đăng ký trong khoảng thời gian này.</div> : <div className="relative mt-4 flex h-36 items-end justify-between gap-2 sm:gap-4 pt-4">
            {/* Horizontal Grid lines */}
            <div className="pointer-events-none absolute inset-x-0 inset-y-0 flex flex-col justify-between text-[9px] text-muted-foreground/60">
              <div className="border-b border-dashed border-border/60 pb-0.5">
                <span>{maxCount}</span>
              </div>
              <div className="border-b border-dashed border-border/60 pb-0.5">
                <span>{Math.round(maxCount / 2)}</span>
              </div>
              <div className="border-b border-border/80">
                <span>0</span>
              </div>
            </div>

            {/* Bars */}
            {series.map((item, idx) => {
              const heightPercent = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 4) : 4;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.date}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative z-10 flex flex-1 flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-10 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 pointer-events-none transition-all">
                      <span>
                        {item.label} ({item.date}): <strong>{item.count} users</strong>
                      </span>
                    </div>
                  )}

                  {/* Visual Bar */}
                  <div className="relative w-full max-w-[28px] flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered
                          ? 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                          : item.count > 0
                          ? 'bg-sky-500/80 dark:bg-sky-500'
                          : 'bg-border/60'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-2 font-mono text-[10px] transition-colors ${
                      isHovered ? 'font-bold text-sky-500 dark:text-sky-400' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <i className="h-2 w-2 rounded-full bg-sky-500" />
          <span>New sign-ups trend</span>
        </span>
        <span className="font-mono">Total DB accounts: {totalAllAccounts}</span>
      </div>
    </section>
  );
}
