'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { postsService } from '@/lib/posts/posts-service';
import { PostEntity } from '@/types/content';

interface DailyLearningItem { id: string; title: string; href: string; }

export function DailyLearningStrip() {
  const [learningItems, setLearningItems] = useState<DailyLearningItem[]>([]);
  useEffect(() => { let isMounted = true; postsService.getFeed({ limit: 4, sortBy: 'publishedAt', contentType: 'SERIES' }).then((res) => { if (!isMounted || !res?.data?.length) return; setLearningItems(res.data.map((post: PostEntity) => ({ id: post.id, title: post.title, href: `/posts/${post.contentType.toLowerCase()}/${post.slug}` }))); }).catch(() => {}); return () => { isMounted = false; }; }, []);
  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const items = [...learningItems.slice(0, 4), ...learningItems.slice(0, 4)];
  return <div className="flex flex-col items-start gap-2.5 border-b border-slate-200 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-4 dark:border-[#253044]"><span className="shrink-0 whitespace-nowrap font-heading text-sm font-bold text-slate-950 dark:text-slate-100">{today}</span><span className="hidden select-none text-slate-300 sm:block dark:text-slate-700">|</span><div className="relative min-w-0 flex-1 overflow-hidden"><div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-950" /><div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-slate-100 to-transparent dark:from-slate-950" /><div className="learning-marquee flex w-max items-center text-sm">{items.map((item, index) => <span key={`${item.id}-${index}`} className="flex shrink-0 items-center">{index > 0 && <span className="mx-2.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-amber-100 dark:bg-amber-400 dark:ring-amber-950/70" />}<Link href={item.href} className="max-w-[18rem] truncate font-bold text-slate-900 transition-colors hover:text-teal-700 sm:max-w-sm dark:text-slate-200 dark:hover:text-teal-300">{item.title}</Link></span>)}</div></div><style jsx>{`.learning-marquee { animation: learning-marquee 28s linear infinite; will-change: transform; } .learning-marquee:hover { animation-play-state: paused; } @keyframes learning-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } @media (prefers-reduced-motion: reduce) { .learning-marquee { animation: none; } }`}</style></div>;
}
