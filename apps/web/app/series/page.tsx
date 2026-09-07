'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search } from 'lucide-react';

const topics = ['Tất cả', 'Tài chính', 'Sức khỏe', 'Công nghệ', 'Kỹ năng sống', 'Sự nghiệp'] as const;

const seriesList = [
  {
    title: 'Quản lý tài chính cá nhân',
    slug: 'quan-ly-tai-chinh-ca-nhan',
    topic: 'Tài chính',
    count: 12,
    description: 'Từ thu nhập, chi tiêu đến kế hoạch tích lũy cho các mục tiêu quan trọng.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Sức khỏe chủ động mỗi ngày',
    slug: 'suc-khoe-chu-dong-moi-ngay',
    topic: 'Sức khỏe',
    count: 8,
    description: 'Những nền tảng đơn giản để xây dựng cơ thể khỏe và lối sống bền vững.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Làm việc hiệu quả trong thời đại số',
    slug: 'lam-viec-hieu-qua-trong-thoi-dai-so',
    topic: 'Công nghệ',
    count: 10,
    description: 'Hệ thống công cụ, tư duy và thói quen để tập trung tốt hơn mỗi ngày.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Đầu tư chứng khoán từ nền tảng',
    slug: 'dau-tu-chung-khoan-tu-nen-tang',
    topic: 'Tài chính',
    count: 12,
    description: 'Các khái niệm cốt lõi về thị trường và cách bắt đầu đầu tư có kỷ luật.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Giao tiếp rõ ràng, làm việc tự tin',
    slug: 'giao-tiep-ro-rang-lam-viec-tu-tin',
    topic: 'Kỹ năng sống',
    count: 7,
    description: 'Lắng nghe, phản hồi và trình bày ý tưởng thuyết phục trong mọi tình huống.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Xây dựng sự nghiệp có định hướng',
    slug: 'xay-dung-su-nghiep-co-dinh-huong',
    topic: 'Sự nghiệp',
    count: 9,
    description: 'Từ hiểu bản thân đến phát triển năng lực và lựa chọn bước đi tiếp theo.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
  },
] as const;

export default function SeriesPage() {
  const [topic, setTopic] = useState<(typeof topics)[number]>('Tất cả');
  const [query, setQuery] = useState('');

  const shown = useMemo(
    () =>
      seriesList.filter(
        (x) =>
          (topic === 'Tất cả' || x.topic === topic) &&
          `${x.title} ${x.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [topic, query]
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 lg:py-14">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-primary">
            <BookOpen aria-hidden="true" className="h-4 w-4" /> THƯ VIỆN KIẾN THỨC
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-heading">
            Series chọn lọc
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Khám phá kiến thức được biên soạn theo từng chủ đề — để hiểu sâu hơn và áp dụng tốt hơn vào cuộc sống.
          </p>
        </header>

        <section aria-label="Tìm và lọc series" className="mt-8">
          <label className="relative block max-w-xl">
            <span className="sr-only">Tìm series</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm series..."
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((x) => (
              <button
                type="button"
                key={x}
                aria-pressed={topic === x}
                onClick={() => setTopic(x)}
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  topic === x
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-foreground font-heading">
              {topic === 'Tất cả' ? 'Khám phá series' : topic}
            </h2>
            <span aria-live="polite" className="text-sm text-muted-foreground">
              {shown.length} series
            </span>
          </div>

          {shown.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((x) => (
                <article
                  key={x.title}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative aspect-16/9 overflow-hidden">
                    <Image
                      src={x.image}
                      alt=""
                      fill
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                  </div>
                  <div className="p-5">
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {x.topic}
                    </span>
                    <h3 className="mt-3 text-xl font-extrabold tracking-tight text-foreground font-heading">
                      {x.title}
                    </h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{x.description}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <BookOpen aria-hidden="true" className="h-4 w-4 text-primary" />
                        {x.count} bài viết
                      </span>
                      <Link
                        href={`/series/${x.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Xem series{' '}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
              <Search aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-4 font-bold text-foreground">Chưa có series phù hợp</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hãy thử một từ khóa hoặc chủ đề khác.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
