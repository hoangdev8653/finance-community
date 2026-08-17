import React from 'react';
import { FileText, PenTool, Eye, Users } from 'lucide-react';
import { DashboardMetrics } from '../../types/dashboard';

interface DashboardMetricsBarProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export function DashboardMetricsBar({ metrics, isLoading }: DashboardMetricsBarProps) {
  const cards = [
    {
      label: 'Published Analyses',
      value: metrics.totalAnalyses.toLocaleString(),
      description: 'Active editorial notes',
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Research Drafts',
      value: metrics.draftsCount.toLocaleString(),
      description: 'Unpublished works in progress',
      icon: PenTool,
      color: 'text-amber-500',
    },
    {
      label: 'Total Views',
      value: metrics.totalViews.toLocaleString(),
      description: 'Cumulative readership',
      icon: Eye,
      color: 'text-emerald-500',
    },
    {
      label: 'Followers',
      value: metrics.followersCount.toLocaleString(),
      description: 'Subscribed market analysts',
      icon: Users,
      color: 'text-sky-500',
    },
  ];

  return (
    <section aria-label="Portfolio Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <Icon className={`h-4 w-4 ${card.color}`} aria-hidden="true" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
                {isLoading ? '—' : card.value}
              </span>
              <p className="text-[11px] text-muted-foreground mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
