'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useTagBySlug } from '@/lib/search/use-search';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { Button } from '@/components/ui/Button';
import { Tag, ArrowLeft, Loader2 } from 'lucide-react';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TagExplorePage({ params }: TagPageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug);

  const { data: tag, isLoading, isError } = useTagBySlug(decodedSlug);
  const [page, setPage] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-mono text-muted-foreground">Loading topic tag details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link href="/search">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Discovery</span>
          </Button>
        </Link>
      </div>

      {/* Tag Hero Header */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tag className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              #{tag ? tag.name : decodedSlug}
            </h1>
            <p className="text-xs font-mono text-muted-foreground">
              Curated market publications, analyses, and series under this topic
            </p>
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Publications Labeled #{tag ? tag.name : decodedSlug}
        </h2>
        <SearchResultsList
          filters={{
            tagId: tag ? tag.id : undefined,
            page,
          }}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
