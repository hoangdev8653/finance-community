'use client';

import Link from 'next/link';
import { MessageCircle, PenLine, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import { FeedList } from '@/components/content/FeedList';

const topics = ['Tài chính cá nhân', 'Chứng khoán', 'Crypto', 'Kinh doanh', 'Kỹ năng sống'];

export function CommunityPostsView() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="mx-auto max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
        <header className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-6 sm:p-9 dark:border-emerald-950/60 dark:from-emerald-950/20 dark:via-background dark:to-background">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"><UsersRound className="h-3.5 w-3.5" /> CỘNG ĐỒNG BREWSEVEN</p>
              <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Góc nhìn từ cộng đồng</h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">Chia sẻ kinh nghiệm, đặt câu hỏi và cùng nhau xây dựng thói quen tài chính vững vàng.</p>
            </div>
            <Link href="/bai-viet/tao-moi" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"><PenLine className="h-4 w-4" /> Viết bài</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-emerald-100 pt-5 dark:border-emerald-950/60">
            {topics.map((topic) => <button key={topic} type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{topic}</button>)}
          </div>
        </header>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section aria-labelledby="community-feed-title"><div className="mb-4 flex items-center justify-between"><h2 id="community-feed-title" className="flex items-center gap-2 font-heading text-xl font-bold"><TrendingUp className="h-5 w-5 text-emerald-600" /> Bài viết mới nhất</h2><span className="text-xs font-semibold text-muted-foreground">Mới nhất</span></div><FeedList contentType="COMMUNITY" onResetFilters={() => {}} /></section>
          <aside className="space-y-4"><div className="rounded-2xl border border-border bg-card p-5"><h2 className="flex items-center gap-2 font-heading text-sm font-bold"><Sparkles className="h-4 w-4 text-emerald-600" /> Đang thảo luận</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Các cuộc trò chuyện nổi bật sẽ xuất hiện tại đây.</p></div><div className="rounded-2xl border border-border bg-card p-5"><h2 className="flex items-center gap-2 font-heading text-sm font-bold"><MessageCircle className="h-4 w-4 text-emerald-600" /> Cùng tham gia</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Đăng nhập để đăng bài, bình luận và lưu những góc nhìn hữu ích.</p><Link href="/dang-nhap" className="mt-4 inline-flex text-sm font-bold text-emerald-700 hover:underline">Đăng nhập</Link></div></aside>
        </div>
      </div>
    </main>
  );
}
