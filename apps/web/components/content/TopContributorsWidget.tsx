'use client';

import React from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const topContributors = [
  {
    name: 'Sarah Chen, CFA',
    role: 'Wealth Strategist',
    username: 'sarah_chen',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'David Miller',
    role: 'Financial Planner',
    username: 'david_miller',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    name: 'Elena Rostova',
    role: 'Corporate Finance Lead',
    username: 'elena_rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
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
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {contributor.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {contributor.role}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
