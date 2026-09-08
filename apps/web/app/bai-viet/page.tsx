'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Compass, 
  Layers, 
  MessageSquare, 
  PenLine, 
  Sparkles, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { FeedList } from '@/components/content/FeedList';

type PostFilterType = 'ALL' | 'SERIES' | 'COMMUNITY';

export default function PostsHubPage() {
  const [activeTab, setActiveTab] = useState<PostFilterType>('ALL');

  const contentTypeParam = activeTab === 'ALL' ? undefined : activeTab;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Editorial Header */}
        <header className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Compass className="h-3.5 w-3.5" />
                <span>KHO TRI THỨC TÀI CHÍNH</span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Bài viết & Phân tích chuyên sâu
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Khám phá các bài học theo chuỗi chuyên đề vững chắc hoặc tham gia thảo luận cùng góc nhìn đa chiều từ cộng đồng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/series"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Xem Series</span>
              </Link>
              <Link
                href="/bai-viet/tao-moi"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <PenLine className="h-4 w-4" />
                <span>Viết bài mới</span>
              </Link>
            </div>
          </div>

          {/* Filter Tabs: Phân biệt rõ rệt giữa 2 luồng bài viết */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Tất cả bài viết</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SERIES')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                activeTab === 'SERIES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950/80'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Bài học theo Series</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COMMUNITY')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                activeTab === 'COMMUNITY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950/80'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Bài viết Cộng đồng</span>
            </button>
          </div>
        </header>

        {/* Content Section */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main Feed */}
          <section aria-label="Danh sách bài viết" className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {activeTab === 'ALL' && 'Mới cập nhật gần đây'}
                {activeTab === 'SERIES' && 'Các bài học thuộc Series'}
                {activeTab === 'COMMUNITY' && 'Góc nhìn & Thảo luận cộng đồng'}
              </h2>
              <span className="text-xs font-semibold text-muted-foreground">
                Tự động làm mới
              </span>
            </div>

            <FeedList 
              key={activeTab} 
              contentType={contentTypeParam} 
              onResetFilters={() => setActiveTab('ALL')} 
            />
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Series Explainer Box */}
            <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 to-card p-5 dark:border-indigo-900/60 dark:from-indigo-950/20">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-heading font-bold text-sm">Học theo chuỗi Series</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Các bài viết được biên tập có hệ thống từ cơ bản đến chuyên sâu, có thứ tự chương bài và lưu trữ tiến độ học tập.
              </p>
              <Link
                href="/series"
                className="mt-3 inline-flex items-center text-xs font-bold text-indigo-700 hover:underline dark:text-indigo-400"
              >
                Khám phá các Series ➔
              </Link>
            </div>

            {/* Community Explainer Box */}
            <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-card p-5 dark:border-emerald-900/60 dark:from-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-heading font-bold text-sm">Thảo luận Cộng đồng</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Nơi thành viên tự do chia sẻ nhật ký đầu tư, phân tích thực chiến cổ phiếu và thảo luận văn minh.
              </p>
              <Link
                href="/bai-viet/cong-dong"
                className="mt-3 inline-flex items-center text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Xem trang cộng đồng riêng ➔
              </Link>
            </div>

            {/* Guidelines Card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-bold text-sm">Tiêu chuẩn nội dung</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Tất cả bài viết đều tuân thủ quy tắc ứng xử văn minh, phân tích khách quan và không khuyến nghị mua bán lôi kéo.
              </p>
              <Link
                href="/quy-tac-cong-dong"
                className="mt-3 inline-flex items-center text-xs font-bold text-primary hover:underline"
              >
                Xem quy tắc cộng đồng ➔
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
