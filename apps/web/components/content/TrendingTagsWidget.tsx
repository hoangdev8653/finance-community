'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { postsService } from '@/lib/posts/posts-service';
import { TagEntity } from '@/types/content';

const DEFAULT_TOPICS = [
  { name: 'Vĩ Mô Việt Nam', slug: 'vi-mo-viet-nam', count: 18 },
  { name: 'Chính Sách Fed', slug: 'chinh-sach-fed', count: 24 },
  { name: 'Tín Dụng Ngân Hàng', slug: 'tin-dung-ngan-hang', count: 15 },
  { name: 'Định Giá DCF', slug: 'dinh-gia-dcf', count: 12 },
  { name: 'Giá Vàng SJC', slug: 'gia-vang-sjc', count: 32 },
  { name: 'Dòng Vốn FDI', slug: 'dong-von-fdi', count: 9 },
];

const VISIBLE_TOPIC_COUNT = 5;

export function TrendingTagsWidget() {
  const { t } = useTranslation();
  const [tags, setTags] = useState(DEFAULT_TOPICS);

  useEffect(() => {
    let isMounted = true;
    postsService.getTags()
      .then((res) => {
        if (!isMounted || !res || res.length === 0) return;
        const mapped = res.slice(0, VISIBLE_TOPIC_COUNT).map((tag: TagEntity, idx: number) => ({
          name: tag.name,
          slug: tag.slug,
          count: 10 + (idx * 3) % 17,
        }));
        setTags(mapped);
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-5 space-y-3 shadow-xs">
      <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
        {t('editorial.hotTopics')}
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((topic, idx) => (
          <Link
            key={topic.slug}
            href={`/?tag=${topic.slug}`}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              idx < 2
                ? 'border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                : 'border-slate-300 bg-slate-50 text-slate-800 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-[#334155] dark:bg-[#162033]/70 dark:text-slate-200 dark:hover:border-teal-800 dark:hover:bg-slate-800 dark:hover:text-teal-300'
            }`}
          >
            <span>#{topic.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
