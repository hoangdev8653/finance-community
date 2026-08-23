'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostDetailResponse, PostEntity } from '@/types/content';
import { postsService } from '@/lib/posts/posts-service';
import { resolveMediaUrl } from '@/lib/utils/media';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Sparkles, UserPlus, UserCheck, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

interface PostDetailSidebarProps {
  post: PostDetailResponse;
  categoryName?: string;
}

const VISIBLE_SIDEBAR_TAG_COUNT = 4;

export function PostDetailSidebar({ post, categoryName }: PostDetailSidebarProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<PostEntity[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  useEffect(() => {
    let isMounted = true;
    postsService
      .getFeed({ limit: 4, sortBy: 'publishedAt' })
      .then((res) => {
        if (!isMounted || !res?.data) return;
        // Filter out current post
        const filtered = res.data.filter((p) => p.id !== post.id).slice(0, 3);
        setRelatedPosts(filtered);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingRelated(false);
      });

    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const authorName = post.contentType === 'SERIES' ? 'Ban Biên Tập Chuyên Đề' : 'Ban Biên Tập Finance Pulse';
  const authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  const visibleTags = post.tags?.slice(0, VISIBLE_SIDEBAR_TAG_COUNT) ?? [];
  const hiddenTagCount = (post.tags?.length ?? 0) - visibleTags.length;
  const authorRole = 'Hội đồng Thẩm định & Phân tích Tài chính';

  return (
    <aside className="space-y-6 sticky top-24">
      {/* 1. Author Profile Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <Avatar
            src={authorAvatar}
            fallback="FP"
            size="lg"
            className="ring-2 ring-slate-200 dark:ring-slate-700 rounded-full shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {authorName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {authorRole}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Tổng hợp & thẩm định các phân tích vĩ mô, thị trường tài chính và kinh tế quốc tế.
        </p>

        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          size="sm"
          onClick={() => setIsFollowing((prev) => !prev)}
          className="w-full justify-center gap-1.5 font-sans text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
        >
          {isFollowing ? (
            <>
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Đang theo dõi tác giả</span>
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              <span>Theo dõi tác giả</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Related Articles Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading font-bold text-sm sm:text-base">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bài viết liên quan</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            Tuyển chọn
          </span>
        </div>

        <div className="space-y-3.5">
          {relatedPosts.map((item) => (
            <Link
              key={item.id}
              href={`/posts/${item.contentType.toLowerCase()}/${item.slug}`}
              className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <Image
                  src={resolveMediaUrl(item.coverMediaId)}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-heading text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>5 phút đọc</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/posts"
            className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 group"
          >
            <span>Khám phá thêm bài viết</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3. Related Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading font-bold text-sm">
            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Thẻ chủ đề bài viết</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/?tag=${tag.slug}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}

            {hiddenTagCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                +{hiddenTagCount} thẻ
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
