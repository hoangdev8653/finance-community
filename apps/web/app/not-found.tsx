import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Home,
  Compass,
  Search,
  BookOpen,
  ArrowLeft,
  Layers,
  Tag,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '404 - Không tìm thấy trang',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển trên MorningView.',
};

const quickExploreLinks = [
  {
    title: 'Khám phá bài viết',
    desc: 'Cập nhật phân tích thị trường & nhận định mới nhất',
    href: '/posts',
    icon: Compass,
  },
  {
    title: 'Chuỗi bài học (Series)',
    desc: 'Học đầu tư có hệ thống từ cơ bản đến nâng cao',
    href: '/series',
    icon: BookOpen,
  },
  {
    title: 'Danh mục chủ đề',
    desc: 'Chứng khoán, Vĩ mô, Bất động sản & Ngân hàng',
    href: '/categories',
    icon: Layers,
  },
  {
    title: 'Thư mục Tag',
    desc: 'Tra cứu theo mã cổ phiếu và từ khóa nóng',
    href: '/tags',
    icon: Tag,
  },
];

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Glow Effects */}
      <div
        className="pointer-events-none fixed -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-24 right-1/4 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Standalone Top Bar with Brand & Back to Home */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
            Morning<span className="text-primary">View</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-xs transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về Trang chủ</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-danger shadow-xs">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tín hiệu thị trường bị gián đoạn • Error 404</span>
          </div>

          {/* 404 Big Numeric Typography */}
          <div className="relative my-6 select-none">
            <h1 className="font-heading text-8xl font-extrabold tracking-tighter text-foreground/15 dark:text-foreground/10 sm:text-9xl">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-6 py-3 shadow-card backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <TrendingDown className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-mono font-semibold uppercase text-muted-foreground">Status code</p>
                  <p className="text-sm font-bold text-foreground">Không tìm thấy tài nguyên</p>
                </div>
              </div>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trang bạn tìm kiếm không tồn tại
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Đường dẫn có thể đã bị thay đổi, xóa bỏ hoặc địa chỉ URL chưa chính xác. Đừng lo, thị trường vẫn đang vận động và có rất nhiều tri thức đang chờ bạn!
            </p>
          </div>

          {/* Quick Search Form */}
          <form
            action="/search"
            method="GET"
            className="mx-auto mt-8 max-w-md"
            role="search"
            aria-label="Tìm kiếm trên trang 404"
          >
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Tìm kiếm bài viết, mã cổ phiếu, tác giả..."
                className="h-11 w-full rounded-xl border border-input bg-surface pl-10 pr-24 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 h-8 px-3 text-xs"
              >
                Tìm kiếm
              </Button>
            </div>
          </form>

          {/* Main Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="md">
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>Về Trang chủ</span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="md">
              <Link href="/posts" className="gap-2">
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Khám phá bài viết</span>
              </Link>
            </Button>

            <Button asChild variant="ghost" size="md">
              <Link href="/search" className="gap-2 text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Tra cứu nâng cao</span>
              </Link>
            </Button>
          </div>

          {/* Popular Quick Links Grid */}
          <div className="mt-10 border-t border-border pt-6 text-left">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Gợi ý lối tắt phổ biến
              </h3>
              <span className="text-xs text-muted-foreground">MorningView Directory</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickExploreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-start gap-3.5 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-elevated hover:shadow-card"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Minimal Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MorningView. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
}
