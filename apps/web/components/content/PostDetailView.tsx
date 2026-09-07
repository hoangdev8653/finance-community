'use client';

import React from 'react';
import { PostDetailResponse } from '@/types/content';
import { usePostDetail } from '@/lib/posts/use-post-detail';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { PostHeader } from './PostHeader';
import { PostCoverMedia } from './PostCoverMedia';
import { PostContentRenderer, extractContentHeadings } from './PostContentRenderer';
import { PostTableOfContents } from './PostTableOfContents';
import { PostTagsList } from './PostTagsList';
import { CommentsSection } from './CommentsSection';
import { ReadingProgressBar } from './ReadingProgressBar';
import { PostReactionsBar } from '@/components/reactions/PostReactionsBar';
import { PostAppealBanner } from './PostAppealBanner';
import { SeriesNavigationWidget } from '@/components/series/SeriesNavigationWidget';
import { PostDetailSidebar } from './PostDetailSidebar';
import { LearningActions } from '@/components/learning/LearningActions';
import { LearningQuiz } from '@/components/learning/LearningQuiz';

interface PostDetailViewProps {
  initialPost: PostDetailResponse;
}

export function PostDetailView({ initialPost }: PostDetailViewProps) {
  const { data: post = initialPost } = usePostDetail(
    initialPost.contentType,
    initialPost.slug,
    initialPost
  );

  const categoryMap = useCategoryMap();
  const categoryName = post.categoryId ? categoryMap[post.categoryId]?.name : undefined;

  const isSeries = post.contentType === 'SERIES';
  const headings = extractContentHeadings(post.body);

  return (
    <>
      <ReadingProgressBar />

      <main className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Appeal Banner for author if post is banned/hidden */}
        <PostAppealBanner post={post} />

        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              {
                label: isSeries ? 'Series' : 'Bài viết cộng đồng',
                href: isSeries ? '/series' : '/bai-viet',
              },
              { label: post.title },
            ]}
          />
        </div>

        {/* 2-Column Reader Layout with Rich Sticky Sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Main Article Column */}
          <article className="min-w-0 space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
              <PostHeader post={post} categoryName={categoryName} />
            </div>
            <PostCoverMedia post={post} />

            {/* Mobile In-Article Table of Contents */}
            {headings.length > 0 && (
              <div className="block lg:hidden">
                <PostTableOfContents headings={headings} isMobile={true} />
              </div>
            )}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
              <PostContentRenderer body={post.body} />
            </div>
            {post.contentType === 'SERIES' && <div className="mt-8"><LearningActions postId={post.id} /></div>}
            {post.contentType === 'SERIES' && <LearningQuiz postId={post.id} />}
            <div className="lg:hidden"><PostTagsList tags={post.tags} /></div>
            <PostReactionsBar postId={post.id} />
            {isSeries && <SeriesNavigationWidget postId={post.id} />}
            <CommentsSection postId={post.id} />
          </article>

          {/* Right Sidebar (TOC, Author, Related Articles, Tags) */}
          <div className="hidden lg:block lg:col-span-4">
            <PostDetailSidebar post={post} categoryName={categoryName} headings={headings} />
          </div>
        </div>
      </main>
    </>
  );
}
