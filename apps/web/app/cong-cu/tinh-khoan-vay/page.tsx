import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { LoanCalculatorTool } from '@/components/tools/LoanCalculatorTool';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import {
  Building,
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bảng Tính Lãi Vay Mua Nhà, Mua Xe (Dư Nợ Giảm Dần)',
  description:
    'Tính chính xác số tiền gốc và lãi phải trả hàng tháng khi vay mua nhà, mua ô tô hoặc vay tiêu dùng theo phương pháp dư nợ giảm dần.',
  canonicalPath: '/cong-cu/tinh-khoan-vay',
});

export default function LoanCalculatorPage() {
  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Công cụ tài chính', url: '/cong-cu' },
    { name: 'Bảng tính khoản vay', url: '/cong-cu/tinh-khoan-vay' },
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
            <span className="flex h-6 items-center rounded-full bg-blue-50 px-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <Building className="mr-1.5 h-3.5 w-3.5" />
              Loan & Mortgage Calculator
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Bảng tính Lãi vay Mua nhà & Xe
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Dự toán chính xác số tiền gốc và lãi ngân hàng hàng tháng, so sánh phương án trả góp và lập kế hoạch trả nợ trước hạn thông minh.
          </p>
        </div>

        {/* The Interactive Tool */}
        <LoanCalculatorTool />

        {/* Educational Knowledge Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Nguyên tắc vàng khi vay mua nhà và xe ngân hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Quy tắc tỷ lệ nợ trên thu nhập (DTI - Debt-to-Income):
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tổng số tiền trả nợ gốc và lãi vay hàng tháng <strong>không nên vượt quá 30% - 40%</strong> tổng thu nhập ròng của gia đình. Vượt quá ngưỡng này sẽ khiến bạn dễ rơi vào căng thẳng dòng tiền khi có biến cố bất ngờ.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Lưu ý lãi suất thả nổi:</strong> Các gói ưu đãi thường chỉ cố định trong 6 - 24 tháng đầu. Hãy dự phòng phương án khi lãi suất tăng thêm 2% - 3% trong các năm tiếp theo.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Dư nợ giảm dần vs Dư nợ ban đầu:
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Dư nợ giảm dần (Chuẩn):</strong> Tiền lãi được tính trên số tiền gốc thực tế còn lại. Tiền lãi sẽ ít dần theo thời gian.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span><strong>Trả nợ trước hạn:</strong> Hầu hết ngân hàng sẽ thu phí phạt trả trước hạn (1% - 3% số tiền trả sớm), nhưng tổng tiền lãi tiết kiệm được luôn lớn hơn rất nhiều khoản phí này.</span>
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
                  Mô phỏng sự tăng trưởng hàm mũ của dòng tiền tiết kiệm định kỳ hàng tháng.
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
