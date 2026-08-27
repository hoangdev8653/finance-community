'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { postsService } from '@/lib/posts/posts-service';
import { PostEntity } from '@/types/content';
import { resolveMediaUrl } from '@/lib/utils/media';

interface SeriesItem {
  id: string;
  title: string;
  slug: string;
  count: number;
  image: string;
}

const DEFAULT_FEATURED_SERIES: SeriesItem[] = [
  {
    id: 'ser-1',
    title: 'Thực Hành Xây Dựng Mô Hình DCF (Chiết Khấu Dòng Tiền)',
    slug: 'thuc-hanh-xay-dung-mo-hinh-dcf-tu-du-bao-den-wacc',
    count: 6,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ser-2',
    title: 'Cẩm Nang Đọc Báo Cáo Tài Chính & Bóc Tách Doanh Thu',
    slug: 'the-foundations-of-business-valuation-a-systematic-approach',
    count: 8,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
  },
];

export function FeaturedSeriesWidget() {
  const { t } = useTranslation();
  const [seriesList, setSeriesList] = useState<SeriesItem[]>(DEFAULT_FEATURED_SERIES);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    postsService.getFeed({ contentType: 'SERIES', limit: 4 })
      .then((res) => {
        if (!isMounted || !res?.data || res.data.length === 0) return;
        const mapped: SeriesItem[] = res.data.map((post: PostEntity, idx: number) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          count: 5 + (idx * 2),
          image: resolveMediaUrl(post.coverMediaId, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'),
        }));
        setSeriesList(mapped);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
          {t('editorial.featuredSeries')}
        </h3>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase text-slate-500 dark:bg-[#162033] dark:text-slate-400">
          Guide
        </span>
      </div>

      <div className="space-y-0" onMouseLeave={() => setActiveIndex(0)}>
        {seriesList.slice(0, 4).map((series, idx) => {
          const isActive = idx === activeIndex;

          return (
            <Link
              key={series.id}
              href={`/posts/series/${series.slug}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              className={`group block overflow-hidden transition-[background-color,border-color,box-shadow,margin] duration-300 ease-out ${
                isActive
                  ? 'mb-2 rounded-lg border border-slate-200 bg-slate-50 shadow-2xs hover:border-teal-300 dark:border-[#253044] dark:bg-[#162033]/70 dark:hover:border-teal-800'
                  : 'border-b border-slate-100 dark:border-[#253044]/60 last:border-b-0'
              }`}
            >
              <div
                className={`relative w-full overflow-hidden bg-slate-100 transition-[height,opacity,transform] duration-300 ease-out dark:bg-[#162033] ${
                  isActive ? 'h-28 opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-1'
                }`}
              >
                {isActive && (
                  <Image
                    src={series.image}
                    alt={series.title}
                    fill
                    sizes="340px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
              </div>

              <div
                className={`transition-[padding] duration-300 ease-out ${
                  isActive ? 'p-3' : 'py-3'
                }`}
              >
                <div
                  className={`flex gap-3 transition-all duration-300 ease-out ${
                    isActive ? 'mb-1.5 items-center justify-between' : 'items-start'
                  }`}
                >
                  <span
                    className={`shrink-0 font-heading font-extrabold leading-tight select-none transition-colors duration-300 ${
                      isActive
                        ? 'text-lg text-teal-700 dark:text-teal-400'
                        : 'pt-0.5 text-lg text-slate-300 group-hover:text-teal-600 dark:text-slate-700 dark:group-hover:text-teal-400'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {isActive ? (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {series.count} {t('editorial.episodesCount')}
                    </span>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-sm font-bold text-slate-900 transition-colors duration-300 line-clamp-2 leading-snug group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                          {series.title}
                        </h4>
                        <span className="mt-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {series.count} {t('editorial.episodesCount')}
                        </span>
                      </div>

                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors duration-300 group-hover:text-teal-600 dark:text-slate-700" />
                    </>
                  )}
                </div>

                {isActive && (
                  <h4 className="font-heading text-sm font-bold text-slate-950 transition-colors duration-300 line-clamp-2 leading-snug group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                    {series.title}
                  </h4>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
