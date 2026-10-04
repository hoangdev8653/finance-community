'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { learningCourseService } from '@/lib/learning/learning-course-service';

export function CourseSelector({
  value,
  lessonOrder,
  onChange,
  onOrderChange,
  domainId,
}: {
  value?: string;
  lessonOrder: number;
  onChange: (id: string) => void;
  onOrderChange: (value: number) => void;
  domainId?: string;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['learning-series', domainId],
    queryFn: learningCourseService.list,
    staleTime: 60000,
  });

  const filtered = domainId ? data.filter((series) => series.domainId === domainId) : [];

  return (
    <div className="space-y-4 rounded-[10px] border border-emerald-500/20 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
          Cấu hình Lộ trình & Bài học
        </span>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="post-course-select" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
          Khóa học thuộc về
        </label>
        <select
          id="post-course-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={!domainId || isLoading}
          className="w-full h-11 rounded-[8px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">
            {!domainId ? 'Chọn lĩnh vực trước...' : 'Chọn khóa học...'}
          </option>
          {filtered.map((series) => (
            <option key={series.id} value={series.id}>
              {series.title}
            </option>
          ))}
        </select>
        {domainId && !isLoading && filtered.length === 0 && (
          <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">
            Chưa có khóa học nào thuộc lĩnh vực này.
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="post-lesson-order" className="block text-sm font-bold text-slate-900 dark:text-slate-100">
          Số thứ tự bài trong khóa học
        </label>
        <input
          id="post-lesson-order"
          type="number"
          min={1}
          value={lessonOrder}
          onChange={(e) => onOrderChange(Math.max(1, Number(e.target.value) || 1))}
          className="w-full h-11 rounded-[8px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-2xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
