'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, FileCheck2, PenTool, ArrowRight, Layers } from 'lucide-react';
import { TimeSeriesPoint } from '@/types/admin';

interface AdminContentTrendChartProps {
  series?: TimeSeriesPoint[];
  postStatusBreakdown?: {
    published: number;
    draft: number;
    unreviewed: number;
  };
  totalPosts?: number;
  isLoading?: boolean;
}

export function AdminContentTrendChart({
  series = [],
  postStatusBreakdown = { published: 0, draft: 0, unreviewed: 0 },
  totalPosts = 0,
  isLoading = false,
}: AdminContentTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalNewPosts = series.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...series.map((s) => s.count), 5);

  // SVG Area path generation
  const width = 500;
  const height = 120;
  const points = series.map((s, idx) => {
    const x = series.length > 1 ? (idx / (series.length - 1)) * (width - 40) + 20 : width / 2;
    const y = height - (s.count / maxCount) * (height - 30) - 15;
    return { x, y, count: s.count, label: s.label, date: s.date };
  });

  const pathD =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p, i) => {
            const prev = points[i];
            const cx1 = prev.x + (p.x - prev.x) / 2;
            const cy1 = prev.y;
            const cx2 = prev.x + (p.x - prev.x) / 2;
            const cy2 = p.y;
            return `C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
          })
          .join(' ')
      : '';

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : '';

  return (
    <section
      aria-labelledby="content-analytics-heading"
      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs"
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2
                id="content-analytics-heading"
                className="font-heading text-base font-bold text-foreground"
              >
                Editorial & Content Pipeline
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Publication velocity, drafts created, and moderation flow over the last 7 days.
            </p>
          </div>

          <Link
            href="/admin/posts"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Manage posts</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Highlight Stats Row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <PenTool className="h-3.5 w-3.5 text-emerald-400" />
              <span>7-Day Published</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
              {isLoading ? '…' : `+${totalNewPosts}`}
            </div>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {totalNewPosts > 0 ? 'New research articles' : 'No posts this week'}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Review Queue</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-amber-500 dark:text-amber-400">
              {isLoading ? '…' : postStatusBreakdown.unreviewed}
            </div>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Awaiting editorial check
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-background/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Layers className="h-3.5 w-3.5 text-teal-400" />
              <span>Draft Pipeline</span>
            </div>
            <div className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">
              {isLoading ? '…' : postStatusBreakdown.draft}
            </div>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              In-progress drafts
            </span>
          </div>
        </div>

        {/* 7-Day Real SVG Area Chart */}
        <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Content Production Trend</span>
            <span className="font-mono text-[11px]">Realtime DB aggregation</span>
          </div>

          <div className="relative mt-4 h-36 w-full">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-full w-full overflow-visible"
              role="img"
              aria-label="Editorial activity curve"
            >
              <defs>
                <linearGradient id="contentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <g className="text-border/60" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1">
                <line x1="0" y1="15" x2={width} y2="15" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} />
                <line x1="0" y1={height - 5} x2={width} y2={height - 5} />
              </g>

              {/* Area Fill */}
              {areaD && <path d={areaD} fill="url(#contentGradient)" />}

              {/* Line Stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data Points */}
              {points.map((p, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <g key={p.date} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#34D399' : '#10B981'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-200"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <div
                style={{
                  left: `${(points[hoveredIdx].x / width) * 100}%`,
                }}
                className="pointer-events-none absolute -top-4 -translate-x-1/2 z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 transition-all"
              >
                <span>
                  {points[hoveredIdx].label} ({points[hoveredIdx].date}):{' '}
                  <strong>{points[hoveredIdx].count} posts</strong>
                </span>
              </div>
            )}

            {/* X Axis Labels */}
            <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground px-2">
              {series.map((s, idx) => (
                <span
                  key={s.date}
                  className={`transition-colors ${
                    hoveredIdx === idx
                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                      : ''
                  }`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Total published articles: {postStatusBreakdown.published}</span>
        </span>
        <span className="font-mono">Total DB posts: {totalPosts}</span>
      </div>
    </section>
  );
}
