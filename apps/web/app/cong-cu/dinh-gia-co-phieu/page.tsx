import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StockValuationTool } from '@/components/tools/StockValuationTool';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Building,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = buildPageMetadata({
  title: 'Mô Hình Định Giá Cổ Phiếu & Biên An Toàn (Margin of Safety)',
  description:
    'Định giá nhanh giá trị thực của doanh nghiệp dựa trên mô hình P/E Multiples, chiết khấu cổ tức Gordon và tính toán vùng giá mua an toàn.',
  canonicalPath: '/cong-cu/dinh-gia-co-phieu',
});

export default function StockValuationPage() {
  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Công cụ tài chính', url: '/cong-cu' },
    { name: 'Định giá cổ phiếu', url: '/cong-cu/dinh-gia-co-phieu' },
  ]);

  return (
    <AppShell mainClassName="max-w-6xl">
      <JsonLd data={breadcrumbsSchema} />

      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <Link href="/cong-cu">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tất cả Công cụ tài chính</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center rounded-full bg-purple-50 px-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Stock Valuation & Margin of Safety
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Mô hình Định giá Cổ phiếu & Biên an toàn
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Ước tính giá trị nội tại hợp lý của cổ phiếu theo phương pháp P/E và mô hình chiết khấu cổ tức (DDM), xác định vùng giá mua an toàn trước khi ra quyết định đầu tư.
          </p>
        </div>

        {/* The Interactive Tool */}
        <StockValuationTool />

        {/* Educational Knowledge Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Triết lý đầu tư giá trị & Biên an toàn (Margin of Safety)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Biên an toàn là gì?</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Khái niệm do huyền thoại <strong>Benjamin Graham</strong> sáng lập và được <strong>Warren Buffett</strong> xem là hòn đá tảng trong đầu tư: Chỉ mua một tài sản khi giá thị trường <strong>thấp hơn đáng kể (thường từ 20% - 30%)</strong> so với giá trị thực ước tính của nó.
              </p>
              <div className="rounded-xl bg-purple-50/60 p-3.5 text-xs text-purple-900 dark:bg-purple-950/30 dark:text-purple-200 border border-purple-200/80 dark:border-purple-900">
                <strong>Công thức:</strong> Giá mua an toàn = Giá trị hợp lý × (1 - Mức chiết khấu an toàn)
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                2 Lưu ý quan trọng khi dùng P/E để định giá:
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>So sánh với trung bình ngành:</strong> Không nên dùng P/E cố định cho mọi cổ phiếu; doanh nghiệp tăng trưởng cao (FPT) thường có P/E cao hơn ngành hàng hóa chu kỳ (Thép, Dầu khí).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Chất lượng lợi nhuận (EPS):</strong> Đảm bảo EPS đến từ hoạt động kinh doanh cốt lõi, không phải từ thu nhập đột biến hay bán tài sản một lần.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Explore Other Tools */}
        <section className="space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground">
            Các công cụ tài chính liên quan
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/cong-cu/lai-kep"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Bảng tính lãi kép & Tự do tài chính
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Mô phỏng sức mạnh lãi kép và tích lũy dòng tiền tiết kiệm định kỳ hàng tháng.
                </p>
              </div>
            </Link>

            <Link
              href="/cong-cu/tinh-khoan-vay"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Bảng tính lãi vay mua nhà / xe
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Lập lịch trả nợ gốc và lãi theo phương pháp dư nợ giảm dần chính xác.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
