'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { postsService } from '@/lib/posts/posts-service';
import { PostEntity } from '@/types/content';

interface DailyNewsItem {
  id: string;
  title: string;
  href: string;
}

const FALLBACK_DISPATCHES: DailyNewsItem[] = [
  {
    id: 'd-1',
    title: 'FED phát tín hiệu nới lỏng chính sách tiền tệ, thị trường tài chính toàn cầu đồng loạt khởi sắc',
    href: '/posts/community/fed-chinh-thuc-ha-lai-suat-buoc-ngoat-noi-long-tien-te-toan-cau',
  },
  {
    id: 'd-2',
    title: 'Dòng vốn FDI và chu kỳ tín dụng mới: Động lực bứt phá của nhóm ngành sản xuất & xuất khẩu',
    href: '/posts/community/dong-von-fdi-va-chu-ky-tin-dung-moi-dong-luc-but-pha-san-xuat',
  },
];

export function DailyNewsStrip() {
  const { locale } = useTranslation();
  const [newsItems, setNewsItems] = useState<DailyNewsItem[]>(FALLBACK_DISPATCHES);

  useEffect(() => {
    let isMounted = true;
    postsService.getFeed({ limit: 4, sortBy: 'publishedAt' })
      .then((res) => {
        if (!isMounted || !res?.data || res.data.length === 0) return;
        const mapped: DailyNewsItem[] = res.data.map((post: PostEntity) => ({
          id: post.id,
          title: post.title,
          href: `/posts/${post.contentType.toLowerCase()}/${post.slug}`,
        }));
        setNewsItems(mapped);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const todayFormatted = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const visibleNewsItems = newsItems.slice(0, 4);
  const marqueeItems = [...visibleNewsItems, ...visibleNewsItems];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 py-2.5 text-sm border-b border-slate-200 dark:border-[#253044]">
      {/* Date label */}
      <span className="shrink-0 font-heading text-sm font-bold text-slate-950 dark:text-slate-100 whitespace-nowrap">
        {todayFormatted}
      </span>

      {/* Divider */}
      <span className="hidden sm:block text-slate-300 dark:text-slate-700 select-none">|</span>

      {/* Headlines row */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-950" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-slate-100 to-transparent dark:from-slate-950" />
        <div className="news-marquee flex w-max items-center text-sm">
          {marqueeItems.map((item, idx) => (
            <span key={`${item.id}-${idx}`} className="flex items-center shrink-0">
              {idx > 0 && (
                <span className="mx-2.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-amber-100 dark:bg-amber-400 dark:ring-amber-950/70 select-none" />
              )}
              <Link
                href={item.href}
                className="max-w-[18rem] truncate font-bold text-slate-900 transition-colors hover:text-teal-700 dark:text-slate-200 dark:hover:text-teal-300 sm:max-w-sm"
              >
                {item.title}
              </Link>
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        .news-marquee {
          animation: news-marquee 28s linear infinite;
          will-change: transform;
        }

        .news-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes news-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .news-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
