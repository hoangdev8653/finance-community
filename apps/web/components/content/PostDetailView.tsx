'use client';

import React from 'react';
import { PostDetailResponse } from '@/types/content';
import { usePostDetail } from '@/lib/posts/use-post-detail';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { PostHeader } from './PostHeader';
import { PostCoverMedia } from './PostCoverMedia';
import { PostContentRenderer } from './PostContentRenderer';
import { PostTagsList } from './PostTagsList';
import { CommentsSection } from './CommentsSection';
import { ReadingProgressBar } from './ReadingProgressBar';
import { PostReactionsBar } from '@/components/reactions/PostReactionsBar';
import { PostAppealBanner } from './PostAppealBanner';
import { SeriesNavigationWidget } from '@/components/series/SeriesNavigationWidget';
import { ShieldCheck, BookOpen } from 'lucide-react';

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

  return (
    <>
      <ReadingProgressBar />

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        {/* Appeal Banner for author if post is banned/hidden */}
        <PostAppealBanner post={post} />

        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              {
                label: isSeries ? 'Educational Series' : 'Market Feed',
                href: isSeries ? '/?type=SERIES' : '/',
              },
              { label: post.title },
            ]}
          />
        </div>

        {isSeries ? (
          /* Educational Series 2-Column Reader Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <article className="lg:col-span-9 space-y-6">
              <PostHeader post={post} categoryName={categoryName} />
              <PostCoverMedia post={post} />
              <PostContentRenderer body={post.body} />
              <PostTagsList tags={post.tags} />
              <PostReactionsBar postId={post.id} />
              <SeriesNavigationWidget postId={post.id} />
              <CommentsSection postId={post.id} />
            </article>

            {/* Right Column: Series Context & Standards */}
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-lg border border-border bg-surface p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>Curated Series</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This analysis is part of Finance Pulse's structured learning curricula, verified for educational rigor.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Analytical Rigor</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All assumptions, valuation formulas, and macroeconomic datasets are documented with verifiable sources.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Focused Community Post Layout */
          <article className="max-w-3xl mx-auto space-y-6">
            <PostHeader post={post} categoryName={categoryName} />
            <PostCoverMedia post={post} />
            <PostContentRenderer body={post.body} />
            <PostTagsList tags={post.tags} />
            <PostReactionsBar postId={post.id} />
            <CommentsSection postId={post.id} />
          </article>
        )}
      </main>
    </>
  );
}
