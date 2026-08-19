'use client';

import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const topContributors = [
  {
    name: 'Joan Names',
    username: 'joan_names',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Antona Names',
    username: 'antona_names',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Joan Names',
    username: 'joan_research',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
];

export function TopContributorsWidget() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
        <Award className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
        <span>Top Contributors</span>
      </div>

      <div className="space-y-3.5">
        {topContributors.map((contributor, idx) => (
          <Link
            key={idx}
            href={`/profile/${contributor.username}`}
            className="flex items-center gap-3.5 group p-1 -m-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Avatar
              src={contributor.avatarUrl}
              fallback={contributor.name.slice(0, 2).toUpperCase()}
              size="md"
              className="ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500/50 transition-all"
            />
            <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {contributor.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
