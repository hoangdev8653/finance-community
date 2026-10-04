"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PostDetailResponse, PostEntity } from "@/types/content";
import { postsService } from "@/lib/posts/posts-service";
import { resolveMediaUrl } from "@/lib/utils/media";
import { PostTableOfContents } from "./PostTableOfContents";
import { CourseNavigationWidget } from "@/components/courses/CourseNavigationWidget";
import { ContentHeading } from "./PostContentRenderer";
import { Sparkles, Clock, Tag, ArrowRight, UserRound, UsersRound } from "lucide-react";

interface PostDetailSidebarProps {
  post: PostDetailResponse;
  categoryName?: string;
  headings?: ContentHeading[];
}

const VISIBLE_SIDEBAR_TAG_COUNT = 4;

const DIVERSE_FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80', // Thị trường / Biểu đồ
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80', // Tăng trưởng đầu tư
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&auto=format&fit=crop&q=80', // Tài chính cá nhân
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80', // Doanh nghiệp / Vĩ mô
];

export function PostDetailSidebar({
  post,
  headings = [],
}: PostDetailSidebarProps) {
  const [relatedPosts, setRelatedPosts] = useState<PostEntity[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  useEffect(() => {
    let isMounted = true;
    postsService
      .getFeed({ limit: 4, sortBy: "publishedAt" })
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

  const visibleTags = post.tags?.slice(0, VISIBLE_SIDEBAR_TAG_COUNT) ?? [];
  const isSeries = post.contentType === "SERIES";
  const authorName = post.author?.displayName || post.author?.username || "BrewSeven";
  const authorAvatar = post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=10b981&color=fff&size=96`;

  return (
    <aside className={isSeries ? "flex h-full flex-col gap-6" : "space-y-6"}>
      {!isSeries && (
        <section className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs text-card-foreground">
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
            <UserRound className="h-4 w-4 text-emerald-600" /> Về tác giả
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                {authorName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Thành viên tích cực
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Chia sẻ những góc nhìn thực tế để xây dựng thói quen tài chính bền
            vững mỗi ngày.
          </p>
          <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 text-center rounded-lg bg-muted/30 py-2.5">
            <div>
              <p className="text-sm font-bold font-mono">24</p>
              <p className="text-[11px] text-muted-foreground">Bài viết</p>
            </div>
            <div>
              <p className="text-sm font-bold font-mono">3.2K</p>
              <p className="text-[11px] text-muted-foreground">Lượt thích</p>
            </div>
            <div>
              <p className="text-sm font-bold font-mono">1.1K</p>
              <p className="text-[11px] text-muted-foreground">Theo dõi</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            <UsersRound className="h-3.5 w-3.5" /> Theo dõi
          </button>
        </section>
      )}
      {isSeries && (
        <CourseNavigationWidget postId={post.id} currentTitle={post.title} />
      )}
      {isSeries && headings.length > 0 && (
        <div className="min-h-0 flex-1">
          <PostTableOfContents
            headings={headings}
            className="mt-4 sticky !top-32 self-start"
          />
        </div>
      )}
      {!isSeries && headings.length > 0 && (
        <PostTableOfContents headings={headings} />
      )}

      {/* Related Articles Card */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs text-card-foreground">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
          <div className="flex items-center gap-2 text-foreground font-heading font-bold text-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bài viết liên quan</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            Tuyển chọn
          </span>
        </div>

        <div className="space-y-3">
          {isLoadingRelated ? (
            <div className="space-y-3" aria-label="Đang tải bài viết liên quan">
              <div className="h-16 animate-pulse rounded-lg bg-muted" />
              <div className="h-16 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : relatedPosts.length ? (
            relatedPosts.map((item, index) => {
              const fallback = DIVERSE_FALLBACK_COVERS[index % DIVERSE_FALLBACK_COVERS.length];
              const imgUrl = resolveMediaUrl(item.coverMediaId, fallback);

              return (
                <Link
                  key={item.id}
                  href={`/bai-viet/${item.contentType.toLowerCase()}/${item.slug}`}
                  className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Thumbnail with diverse imagery */}
                  <div className="relative h-15 w-15 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/80 shadow-2xs">
                    <Image
                      src={imgUrl}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-heading text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-sans">
                      <Clock className="h-3 w-3" />
                      <span>5 phút đọc</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="rounded-lg bg-muted/40 px-3 py-4 text-center text-xs leading-5 text-muted-foreground">
              Chưa có bài viết liên quan. Khám phá thêm các chủ đề mới nhất của BrewSeven.
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-border/60">
          <Link
            href="/bai-viet"
            className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 group"
          >
            <span>Khám phá thêm bài viết</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3. Related Tags */}
      {!isSeries && visibleTags.length > 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-2xs text-card-foreground">
          <div className="flex items-center gap-2 text-foreground font-heading font-bold text-sm">
            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Chủ đề thảo luận</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {visibleTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/the/${tag.slug}`}
                className="inline-flex items-center rounded-md border border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
