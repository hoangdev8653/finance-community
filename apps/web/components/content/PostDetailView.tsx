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

        {/* 2-Column Reader Layout with Rich Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
          {/* Main Article Column */}
          <article className="lg:col-span-8 space-y-6">
            <PostHeader post={post} categoryName={categoryName} />
            <PostCoverMedia post={post} />
            <PostContentRenderer body={post.body} />
            {post.contentType === 'SERIES' && <div className="mt-8"><LearningActions postId={post.id} /></div>}
            {post.contentType === 'SERIES' && <LearningQuiz postId={post.id} />}
            <PostTagsList tags={post.tags} />
            <PostReactionsBar postId={post.id} />
            {isSeries && <SeriesNavigationWidget postId={post.id} />}
            <CommentsSection postId={post.id} />
          </article>

          {/* Right Sticky Sidebar (Author, Related Articles, Tags) */}
          <div className="hidden lg:block lg:col-span-4">
            <PostDetailSidebar post={post} categoryName={categoryName} />
          </div>
        </div>
      </main>
    </>
  );
}
