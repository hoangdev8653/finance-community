import type { Metadata } from 'next';
import Image from 'next/image';
import { BarChart3, BookOpen, Home, Lightbulb, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StockValuationTool } from '@/components/tools/StockValuationTool';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = buildPageMetadata({
  title: 'Mô Hình Định Giá Cổ Phiếu & Biên An Toàn (Margin of Safety)',
  description: 'Định giá nhanh giá trị thực của doanh nghiệp dựa trên mô hình P/E Multiples, chiết khấu cổ tức Gordon và tính toán vùng giá mua an toàn.',
  canonicalPath: '/cong-cu/dinh-gia-co-phieu',
});

const explanationCards = [
  { icon: BarChart3, title: 'Giá trị hợp lý', text: 'Là giá trị ước tính dựa trên khả năng tạo lợi nhuận của doanh nghiệp, thường được tính bằng EPS × P/E mục tiêu.' },
  { icon: ShieldCheck, title: 'Biên an toàn là gì?', text: 'Là mức chiết khấu so với giá trị hợp lý để giảm thiểu rủi ro khi đầu tư, được Benjamin Graham khuyến nghị.' },
  { icon: BookOpen, title: 'Lưu ý khi dùng P/E', text: 'P/E phù hợp nhất khi so sánh trong cùng ngành. Không nên dùng P/E cố định cho mọi cổ phiếu.' },
];

export default function StockValuationPage() {
  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Công cụ tài chính', url: '/cong-cu' },
    { name: 'Định giá cổ phiếu', url: '/cong-cu/dinh-gia-co-phieu' },
  ]);

  return (
    <AppShell mainClassName="max-w-none">
      <JsonLd data={breadcrumbsSchema} />
      <div className="stock-valuation-page space-y-4 sm:space-y-5">
        <header className="relative overflow-hidden rounded-[10px] bg-[#f2fdfa] px-4 py-4 sm:px-6 sm:py-5 dark:bg-emerald-950/30">
          <Image
            src="/images/stock-valuation-hero-banner-v2.png"
            alt=""
            aria-hidden="true"
            width={2172}
            height={724}
            priority
            className="pointer-events-none absolute -bottom-10 -right-8 hidden h-[230px] w-auto max-w-none select-none lg:block"
          />
          <div className="relative flex items-center gap-2 text-[11px] font-medium text-muted-foreground"><Home aria-hidden="true" className="h-3.5 w-3.5" /><span>Định giá cổ phiếu</span></div>
          <div className="relative mt-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><BarChart3 aria-hidden="true" className="h-3.5 w-3.5" /> P/E & Biên an toàn</span><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Định giá cổ phiếu<span className="sr-only"> — Mô hình Định giá Cổ phiếu & Biên an toàn</span></h1><p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">Ước tính giá trị hợp lý và xác định vùng mua an toàn trước khi đầu tư.</p></div>
        </header>

        <StockValuationTool />

        <section className="rounded-[10px] border border-border bg-card p-4 shadow-card sm:p-5">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300"><Lightbulb aria-hidden="true" className="h-5 w-5" /></div><div><h2 className="text-base font-extrabold text-foreground">Hiểu nhanh kết quả</h2><p className="text-[11px] text-muted-foreground">Một số khái niệm quan trọng giúp bạn hiểu rõ hơn về cách định giá.</p></div></div><span className="sr-only">Triết lý đầu tư giá trị & Biên an toàn. Stock Valuation & Margin of Safety.</span>
          <div className="mt-4 grid gap-3 md:grid-cols-3">{explanationCards.map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-3 rounded-[10px] border border-border bg-background p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><Icon aria-hidden="true" className="h-5 w-5" /></div><div><h3 className="text-xs font-extrabold text-foreground">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{text}</p></div></article>)}</div>
          <div className="mt-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-[11px] text-violet-900 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200"><strong>Công thức:</strong> Giá mua an toàn = Giá trị hợp lý × (1 − Mức chiết khấu an toàn)</div>
        </section>
      </div>
    </AppShell>
  );
}
