'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { postsService } from '@/lib/posts/posts-service';
import { queryKeys } from '@/lib/query/keys';
import { TagEntity } from '@/types/content';

const DEFAULT_TOPICS = [
  { name: 'Vĩ Mô Việt Nam', slug: 'vi-mo-viet-nam' },
  { name: 'Chính Sách Fed', slug: 'chinh-sach-fed' },
  { name: 'Tín Dụng Ngân Hàng', slug: 'tin-dung-ngan-hang' },
  { name: 'Định Giá DCF', slug: 'dinh-gia-dcf' },
  { name: 'Giá Vàng SJC', slug: 'gia-vang-sjc' },
  { name: 'Dòng Vốn FDI', slug: 'dong-von-fdi' },
];

const VISIBLE_TOPIC_COUNT = 6;

export function TrendingTagsWidget() {
  const { t } = useTranslation();

  const { data: tags = DEFAULT_TOPICS } = useQuery({
    queryKey: queryKeys.tags.list('', VISIBLE_TOPIC_COUNT),
    queryFn: () => postsService.getTags('', VISIBLE_TOPIC_COUNT),
    select: (res: TagEntity[]) => {
      if (!res || res.length === 0) return DEFAULT_TOPICS;
      return res.slice(0, VISIBLE_TOPIC_COUNT).map((tag) => ({
        name: tag.name,
        slug: tag.slug,
      }));
    },
    staleTime: 15 * 60 * 1000,
  });

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
