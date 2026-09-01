'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { PostsExplorerHeader } from './PostsExplorerHeader';
import { FeedList } from '@/components/content/FeedList';

export function PostsExplorerView() {
  const searchParams = useSearchParams();
  const urlCategoryId = searchParams?.get('categoryId') || undefined;
  const urlContentType = (searchParams?.get('contentType') as 'SERIES' | 'COMMUNITY') || undefined;

  const [contentType, setContentType] = useState<'SERIES' | 'COMMUNITY' | undefined>(urlContentType);
  const [categoryId, setCategoryId] = useState<string | undefined>(urlCategoryId);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'createdAt'>('publishedAt');

  // Sync if URL search params explicitly change externally
  useEffect(() => {
    if (urlCategoryId !== undefined) {
      setCategoryId(urlCategoryId);
    }
    if (urlContentType !== undefined) {
      setContentType(urlContentType);
    }
  }, [urlCategoryId, urlContentType]);

  const { data: categories = [] } = useCategories();

  const handleResetFilters = () => {
    setContentType(undefined);
    setCategoryId(undefined);
    setSortBy('publishedAt');
  };

  return (
    <div className="space-y-8">
      <PostsExplorerHeader
        contentType={contentType}
        categoryId={categoryId}
        sortBy={sortBy}
        categories={categories}
        onContentTypeChange={setContentType}
        onCategoryChange={setCategoryId}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* Main Filtered Feed Stream */}
      <div className="space-y-4">
        <FeedList
          contentType={contentType}
          categoryId={categoryId}
          sortBy={sortBy}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
}
