"use client";

import React from "react";
import { PostDetailResponse } from "@/types/content";
import { usePostDetail } from "@/lib/posts/use-post-detail";
import { useCategoryMap } from "@/lib/posts/use-posts-feed";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { PostHeader } from "./PostHeader";
import { PostCoverMedia } from "./PostCoverMedia";
import {
  PostContentRenderer,
  extractContentHeadings,
} from "./PostContentRenderer";
import { PostTableOfContents } from "./PostTableOfContents";
import { PostTagsList } from "./PostTagsList";
import { CommentsSection } from "./CommentsSection";
import { ReadingProgressBar } from "./ReadingProgressBar";
import { PostReactionsBar } from "@/components/reactions/PostReactionsBar";
import { PostAppealBanner } from "./PostAppealBanner";
import { PostDetailSidebar } from "./PostDetailSidebar";
import { LearningActions } from "@/components/learning/LearningActions";
import { LearningQuiz } from "@/components/learning/LearningQuiz";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";

interface PostDetailViewProps {
  initialPost: PostDetailResponse;
  series?: { name: string; slug: string };
}

export function PostDetailView({ initialPost, series }: PostDetailViewProps) {
  const { data: post = initialPost } = usePostDetail(
    initialPost.contentType,
    initialPost.slug,
    initialPost,
  );

  const categoryMap = useCategoryMap();
  const categoryName = post.categoryId
    ? categoryMap[post.categoryId]?.name
    : undefined;

  const isSeries = post.contentType === "SERIES";
  const headings = extractContentHeadings(post.body);
  const isCommunity = !isSeries;

  return (
    <>
      <ReadingProgressBar />

      <main
        id="main-content"
        className="min-h-screen bg-slate-50 py-8 dark:bg-background sm:py-10"
      >
        <div className="mx-auto w-full max-w-[1440px] px-3.5 sm:px-6 lg:px-8">
          {/* Appeal Banner for author if post is banned/hidden */}
          <PostAppealBanner post={post} />

          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Trang chủ", href: "/" },
                {
                  label: isSeries ? "Khóa học" : "Bài viết cộng đồng",
                  href: isSeries ? "/khoa-hoc" : "/bai-viet/cong-dong",
                },
                ...(isSeries && series
                  ? [
                      {
                        label: series.name,
                        href: `/khoa-hoc/${encodeURIComponent(series.slug)}`,
                      },
                    ]
                  : []),
                { label: post.title },
              ]}
            />
          </div>

          {/* Lesson reader for a course; community posts keep the broader editorial layout. */}
          <div
            className={
              isSeries
                ? "mx-auto grid max-w-[1440px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]"
                : "grid grid-cols-1 gap-8 lg:grid-cols-[56px_minmax(0,1fr)_300px] lg:gap-6"
            }
          >
            {isCommunity && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 flex flex-col items-center overflow-hidden rounded-lg border border-slate-100 bg-white py-2 shadow-sm">
                  <button className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                    <Heart className="h-5 w-5 fill-emerald-100" />
                    125
                  </button>
                  <button className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                    <MessageCircle className="h-5 w-5" />
                    24
                  </button>
                  <button className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                    <Bookmark className="h-5 w-5" />
                    Lưu
                  </button>
                  <button className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                    <Share2 className="h-5 w-5" />
                    Chia sẻ
                  </button>
                </div>
              </aside>
            )}
            {/* Main Article Column */}
            <article className={`min-w-0 space-y-6 ${isSeries ? "" : ""}`}>
              <div
                className={
                  isSeries
                    ? "pt-2 sm:pt-4"
                    : "rounded-lg border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
                }
              >
                <PostHeader post={post} categoryName={categoryName} />
              </div>
              <PostCoverMedia post={post} />

              {/* Mobile In-Article Table of Contents */}
              {headings.length > 0 && (
                <div className="block lg:hidden">
                  <PostTableOfContents headings={headings} isMobile={true} />
                </div>
              )}

              <div
                className={
                  isSeries
                    ? "pb-2 sm:pb-4"
                    : "rounded-lg border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
                }
              >
                <PostContentRenderer body={post.body} />
              </div>
              {post.contentType === "SERIES" && (
                <div className="mt-8">
                  <LearningActions postId={post.id} />
                </div>
              )}
              {post.contentType === "SERIES" && (
                <LearningQuiz postId={post.id} />
              )}
              <div className="lg:hidden">
                <PostTagsList tags={post.tags} />
              </div>
              <PostReactionsBar postId={post.id} />
              {!isSeries && <CommentsSection postId={post.id} />}
            </article>

            {/* Right Sidebar (TOC, Author, Related Articles, Tags) */}
            <div className="hidden lg:block">
              <PostDetailSidebar
                post={post}
                categoryName={categoryName}
                headings={headings}
              />
            </div>
          </div>
          {isSeries && (
            <div className="mr-auto w-full lg:w-[calc(100%-380px)]">
              <CommentsSection postId={post.id} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
