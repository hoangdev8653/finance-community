'use client';

import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

const popularTags = [
  { name: 'Investing', slug: 'investing' },
  { name: 'Personal Finance', slug: 'personal-finance' },
  { name: 'Stock Market', slug: 'stock-market' },
  { name: 'Crypto', slug: 'crypto' },
  { name: 'Financial Analysis', slug: 'financial-analysis' },
  { name: 'Valuation', slug: 'valuation' },
  { name: 'Macroeconomics', slug: 'macroeconomics' },
];

export function TrendingTagsWidget() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
        <Tag className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
        <span>Trending Tags</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-0.5">
        {popularTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/?tag=${tag.slug}`}
            className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
