'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { resolveMediaUrl } from '@/lib/utils/media';
import { formatRelativeTime } from '@/lib/utils/date';
import { calculateReadingMinutes, calculateReadingTime } from '@/lib/utils/reading-time';
import { postsService } from '@/lib/posts/posts-service';
import { queryKeys } from '@/lib/query/keys';

interface LeadStoryItem {
  id: string;
  title: string;
  summary: string;
  authorName: string;
  authorAvatar: string;
  image: string;
  readingMinutes: number;
  timeAgo: string;
  href: string;
}

const DEFAULT_LEAD_STORIES: LeadStoryItem[] = [
  {
    id: 'lead-1',
    title: 'Fed chính thức hạ lãi suất: Bước ngoặt nới lỏng chính sách tiền tệ toàn cầu và tác động đến các thị trường mới nổi',
    summary: 'Phân tích toàn diện quyết định của FOMC: Lãi suất hạ về vùng mới, mở đầu chu kỳ nới lỏng định lượng và định hình lại dòng vốn thị trường.',
    authorName: 'Ban Biên Tập MorningView',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80',
    readingMinutes: 7,
    timeAgo: 'Hôm nay',
    href: '/posts/community/fed-chinh-thuc-ha-lai-suat-buoc-ngoat-noi-long-tien-te-toan-cau',
  },
  {
    id: 'lead-2',
    title: 'Dòng vốn FDI và Chu kỳ Tín dụng mới: Động lực bứt phá của nhóm ngành sản xuất & xuất khẩu Việt Nam',
    summary: 'Đánh giá chuyên sâu về tác động của chính sách tiền tệ nới lỏng kết hợp làn sóng dịch chuyển chuỗi cung ứng công nghệ cao vào Việt Nam.',
    authorName: 'Chuyên Gia Phân Tích',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
    readingMinutes: 5,
    timeAgo: 'Hôm nay',
    href: '/posts/community/dong-von-fdi-va-chu-ky-tin-dung-moi-dong-luc-but-pha-san-xuat',
  },
];

interface DispatchItem {
  id: string;
  title: string;
  image: string;
  timeAgo: string;
  readingTime: string;
  authorName: string;
  href: string;
}

const DEFAULT_SIDE_DISPATCHES: DispatchItem[] = [
  {
    id: 's-1',
    title: 'Bức tranh NIM và Chất lượng Tài sản ngành Ngân hàng: Dự báo xu hướng phân hóa mạnh mẽ',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    timeAgo: 'Hôm qua',
    readingTime: '4 phút',
    authorName: 'Lê Thu Trang',
    href: '/posts/community/buc-tranh-nim-va-chat-luong-tai-san-nganh-ngan-hang',
  },
  {
    id: 's-2',
    title: 'Thực Hành Xây Dựng Mô Hình DCF (Chiết Khấu Dòng Tiền): Từ Dự Báo Đến WACC',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80',
    timeAgo: '2 ngày trước',
    readingTime: '8 phút',
    authorName: 'Chuyên Gia Phân Tích',
    href: '/posts/series/thuc-hanh-xay-dung-mo-hinh-dcf-tu-du-bao-den-wacc',
  },
  {
    id: 's-3',
    title: 'Diễn Biến Giá Vàng Quốc Tế & Tỷ Giá DXY: Động Thái Mua Ròng Của Các Central Banks',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80',
    timeAgo: '3 ngày trước',
    readingTime: '5 phút',
    authorName: 'Trần Minh Hoàng',
    href: '/posts/community/dien-bien-gia-vang-quoc-te-va-ty-gia-dxy-dong-thai-ngan-hang-trung-uong',
  },
];

export function EditorialHeroGrid() {
  const { t } = useTranslation();
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: heroData, isLoading } = useQuery({
    queryKey: queryKeys.posts.list({ limit: 6, sortBy: 'publishedAt' }),
    queryFn: () => postsService.getFeed({ limit: 6, sortBy: 'publishedAt' }),
    select: (res) => {
      if (!res?.data || res.data.length === 0) return null;
      const posts = res.data;

      // Map lead stories (first 2 posts)
      const leads: LeadStoryItem[] = posts.slice(0, 2).map((post) => ({
        id: post.id,
        title: post.title,
        summary: post.metaDescription || (post.body ? post.body.slice(0, 160) + '...' : post.title),
        authorName: post.author?.displayName || post.author?.username || (post.contentType === 'SERIES' ? 'Chuyên Gia MorningView' : 'Ban Biên Tập MorningView'),
        authorAvatar: (post.author?.avatarMediaId ? resolveMediaUrl(post.author.avatarMediaId) : post.author?.avatarUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        image: resolveMediaUrl(post.coverMediaId, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80'),
        readingMinutes: Math.max(3, calculateReadingMinutes(post.body || post.metaDescription || post.title)),
        timeAgo: formatRelativeTime(post.publishedAt || post.createdAt),
        href: `/posts/${post.contentType.toLowerCase()}/${post.slug}`,
      }));

      // Map side dispatches (remaining posts)
      const dispatches: DispatchItem[] = posts.slice(2, 5).map((post) => ({
        id: post.id,
        title: post.title,
        image: resolveMediaUrl(post.coverMediaId, 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80'),
        timeAgo: formatRelativeTime(post.publishedAt || post.createdAt),
        readingTime: calculateReadingTime(post.body || post.title),
        authorName: post.author?.displayName || post.author?.username || 'Chuyên viên phân tích',
        href: `/posts/${post.contentType.toLowerCase()}/${post.slug}`,
      }));

      return {
        leads: leads.length > 0 ? leads : DEFAULT_LEAD_STORIES,
        dispatches: dispatches.length > 0 ? dispatches : DEFAULT_SIDE_DISPATCHES,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const leadStories = heroData?.leads || DEFAULT_LEAD_STORIES;
  const sideDispatches = heroData?.dispatches || DEFAULT_SIDE_DISPATCHES;

  const currentStory = leadStories[activeStoryIdx] || leadStories[0];

  // Auto rotate lead stories every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying || leadStories.length === 0) return;

    const interval = setInterval(() => {
      setActiveStoryIdx((prev) => (prev + 1) % leadStories.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, leadStories.length]);

  const handleNext = () => {
    setActiveStoryIdx((prev) => (prev + 1) % leadStories.length);
  };

  const handlePrev = () => {
    setActiveStoryIdx((prev) => (prev - 1 + leadStories.length) % leadStories.length);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 relative min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="flex gap-1.5">
                <Skeleton className="h-1.5 w-5 rounded-full" />
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-9 sm:h-10 w-full sm:w-4/5 rounded-md" />
            <Skeleton className="h-5 sm:h-6 w-3/4 rounded-md" />
            <Skeleton className="h-12 sm:h-14 w-full rounded-md" />
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-[#253044] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <div className="flex gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 sm:h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#253044]">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-[#253044]/60 last:border-b-0">
                <Skeleton className="h-20 w-24 sm:w-28 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-4/5 rounded-md" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3 w-20 rounded-md" />
                    <Skeleton className="h-3 w-14 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-[#253044] mt-2">
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
      {/* LEFT COLUMN: Lead Story — Clean editorial card */}
      <div
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        className="lg:col-span-7 xl:col-span-8 relative min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] flex flex-col group shadow-xs"
      >
        {/* Cover Photo */}
        <Link
          href={currentStory.href}
          className="absolute inset-0 overflow-hidden bg-slate-100 dark:bg-[#162033]"
        >
          <Image
            src={currentStory.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            priority
          />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/72 to-slate-950/10 dark:from-[#0b0f17] dark:via-[#0b0f17]/72 dark:to-[#0b0f17]/10" />
          <span className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-transparent to-transparent dark:from-[#0b0f17]/60" />
        </Link>

        {/* Content below image */}
        <div className="relative z-10 p-4 sm:p-6 flex min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex-col justify-between flex-1 space-y-4">
          <div className="space-y-3">
            {/* Time + dots */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-200">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="h-3.5 w-3.5 text-amber-300" />
                {currentStory.timeAgo}
              </span>

              {/* Dots carousel */}
              <div className="flex items-center gap-1.5">
                {leadStories.map((story, idx) => (
                  <button
                    key={story.id}
                    onClick={() => setActiveStoryIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeStoryIdx === idx ? 'w-5 bg-teal-300' : 'w-1.5 bg-slate-500/80'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Headline */}
            <div className="flex items-start">
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-bold text-white drop-shadow-sm group-hover:text-teal-200 transition-colors line-clamp-3 leading-snug sm:leading-tight">
                <Link href={currentStory.href}>
                  {currentStory.title}
                </Link>
              </h2>
            </div>

            {/* Excerpt */}
            <div className="max-w-xl flex items-start">
              <p className="text-xs sm:text-sm md:text-base font-medium text-slate-200/90 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {currentStory.summary}
              </p>
            </div>
          </div>

          {/* Footer: Author + navigation */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
              <Avatar
                src={currentStory.authorAvatar}
                fallback={(currentStory.authorName || 'MV').trim().slice(0, 2).toUpperCase()}
                size="sm"
                className="ring-1 ring-white/25 h-8 w-8 rounded-full shrink-0"
              />
              <div className="text-xs truncate">
                <span className="font-bold text-white block truncate">
                  {currentStory.authorName}
                </span>
                <span className="font-medium text-slate-300">
                  {currentStory.readingMinutes} phút đọc
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm"
                  aria-label="Previous lead story"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-sm"
                  aria-label="Next lead story"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={currentStory.href}
                className="inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg bg-white px-3.5 sm:px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-teal-100 cursor-pointer whitespace-nowrap"
              >
                Đọc bài
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Latest dispatches — Clean numbered list */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-xs">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-[#253044]">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {t('editorial.todayDispatches')}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold uppercase text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <Radio className="h-3 w-3" />
              Live
            </span>
          </div>

          {/* List of dispatches with responsive items */}
          <div className="space-y-0">
            {sideDispatches.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative flex items-start gap-3 py-3 sm:py-3.5 border-b border-slate-100 dark:border-[#253044]/60 last:border-b-0 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-24 sm:w-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#162033] shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Text details */}
                <div className="flex h-20 flex-1 min-w-0 flex-col justify-between py-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex w-full items-center justify-between gap-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="min-w-0 truncate">{item.authorName}</span>
                    <span className="shrink-0" suppressHydrationWarning>{item.timeAgo}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#253044] mt-2">
          <Link
            href="/posts"
            className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 group transition-colors"
          >
            <span>{t('editorial.viewAllDispatches')}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}


