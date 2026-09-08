import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { CompoundInterestTool } from '@/components/tools/CompoundInterestTool';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Building,
  BarChart3,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bảng Tính Lãi Kép & Kế Hoạch Tự Do Tài Chính (FIRE)',
  description:
    'Tính toán sức mạnh của lãi kép và dòng tiền tích lũy hàng tháng. Xem biểu đồ trực quan so sánh tiền gốc và lãi sinh sôi theo thời gian.',
  canonicalPath: '/cong-cu/lai-kep',
});

export default function CompoundInterestPage() {
  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Công cụ tài chính', url: '/cong-cu' },
    { name: 'Bảng tính Lãi kép', url: '/cong-cu/lai-kep' },
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
            <span className="flex h-6 items-center rounded-full bg-emerald-50 px-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              Compound Interest Calculator
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Bảng tính Lãi kép & Tự do tài chính
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Khám phá kỳ quan thứ 8 của thế giới. Mô phỏng chính xác sự tăng trưởng của dòng tiền tích lũy định kỳ và tiền lãi sinh sôi qua từng năm.
          </p>
        </div>

        {/* The Interactive Tool */}
        <CompoundInterestTool />

        {/* Educational Knowledge Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Nguyên lý cốt lõi của Lãi kép (Compound Interest)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Công thức toán tài chính chuẩn quốc tế:
              </h3>
              <div className="rounded-xl bg-slate-50 p-4 font-mono text-xs sm:text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
                A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><strong>A</strong>: Tổng số tiền thu được trong tương lai.</li>
                <li><strong>P</strong>: Số vốn gốc ban đầu (Initial Principal).</li>
                <li><strong>PMT</strong>: Số tiền nạp tích lũy định kỳ mỗi tháng.</li>
                <li><strong>r</strong>: Lãi suất danh nghĩa kỳ vọng hàng năm.</li>
                <li><strong>t</strong>: Số năm duy trì tích lũy.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                3 Yếu tố quyết định sự bùng nổ của lãi kép:
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Thời gian (Time Horizon):</strong> Bắt đầu càng sớm, giai đoạn tăng trưởng hàm mũ càng đến nhanh hơn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Tính kỷ luật (Consistency):</strong> Duy trì dòng tiền tiết kiệm đều đặn mỗi tháng quan trọng hơn cố gắng đoán đáy thị trường.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Tái đầu tư (Reinvestment):</strong> Không rút tiền lãi ra tiêu xài mà tiếp tục để tiền lãi tự sinh thêm lãi con.</span>
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
                  Lập lịch trả nợ gốc và lãi theo dư nợ giảm dần, tính toán chi phí vay thực tế.
                </p>
              </div>
            </Link>

            <Link
              href="/cong-cu/dinh-gia-co-phieu"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Mô hình định giá nhanh cổ phiếu
                </h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Ước tính giá trị hợp lý của doanh nghiệp theo mô hình P/E và chiết khấu an toàn.
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
