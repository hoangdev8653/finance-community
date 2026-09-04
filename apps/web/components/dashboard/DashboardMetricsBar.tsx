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
      label: 'Bài viết đã đăng',
      value: metrics.totalAnalyses.toLocaleString(),
      description: 'Bài phân tích đang hiển thị',
      icon: FileText,
      color: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Bản thảo nghiên cứu',
      value: metrics.draftsCount.toLocaleString(),
      description: 'Đang soạn thảo & chuẩn bị',
      icon: PenTool,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Tổng lượt xem',
      value: metrics.totalViews.toLocaleString(),
      description: 'Lượt đọc tích lũy toàn bộ',
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Người theo dõi',
      value: metrics.followersCount.toLocaleString(),
      description: 'Độc giả đang quan tâm',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <section aria-label="Portfolio Metrics" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs sm:text-sm font-heading font-bold text-slate-800 dark:text-slate-300 line-clamp-1">
                {card.label}
              </span>
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-slate-950 dark:text-slate-100 tracking-tight">
                {isLoading ? '—' : card.value}
              </span>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">{card.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
