'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CompoundInterestTool } from '@/components/tools/CompoundInterestTool';
import { LoanCalculatorTool } from '@/components/tools/LoanCalculatorTool';
import { StockValuationTool } from '@/components/tools/StockValuationTool';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  Building,
  BarChart3,
  Share2,
  Check,
  Info,
  Calculator,
} from 'lucide-react';

type ToolTab = 'compound' | 'loan' | 'stock';

function ToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab') as ToolTab | null;
  const [activeTab, setActiveTab] = useState<ToolTab>(
    tabParam === 'loan' || tabParam === 'stock' || tabParam === 'compound'
      ? tabParam
      : 'compound',
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tabParam && (tabParam === 'loan' || tabParam === 'stock' || tabParam === 'compound')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: ToolTab) => {
    setActiveTab(tab);
    router.replace(`/tools?tab=${tab}`, { scroll: false });
  };

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 py-4 sm:py-6">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center rounded-full bg-primary/10 px-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
              <Calculator className="mr-1.5 h-3 w-3" />
              Finance Calculators
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Công cụ tài chính tương tác
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Tự kiểm tra các kịch bản tích lũy lãi kép, lập kế hoạch trả nợ vay ngân hàng và định giá cổ phiếu trực quan ngay trên trình duyệt.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyShare}
          className="gap-2 self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">Đã sao chép link</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ công cụ</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-card p-1.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleTabChange('compound')}
          className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === 'compound'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span>Lãi kép & Tích lũy</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('loan')}
          className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === 'loan'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4 shrink-0" />
          <span>Tính lãi vay mua nhà / xe</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('stock')}
          className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === 'stock'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>Định giá cổ phiếu & Cổ tức</span>
        </button>
      </div>

      {/* Active Tool View */}
      <div className="min-h-[500px]">
        {activeTab === 'compound' && <CompoundInterestTool />}
        {activeTab === 'loan' && <LoanCalculatorTool />}
        {activeTab === 'stock' && <StockValuationTool />}
      </div>

      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300/40 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          <strong>Lưu ý miễn trừ trách nhiệm:</strong> Các kết quả tính toán trên được xây dựng dựa trên công thức toán tài chính chuẩn quốc tế nhằm mục đích hỗ trợ học tập và lập kế hoạch cá nhân. Các thông số thực tế (như biên độ thả nổi lãi suất ngân hàng, phí bảo hiểm khoản vay, thuế cổ tức...) có thể khác biệt tùy thuộc vào chính sách của từng tổ chức tài chính tại từng thời điểm.
        </p>
      </div>
    </main>
  );
}

export default function ToolsPage() {
  return (
    <AppShell showRightSidebar={false}>
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
            Đang khởi tạo công cụ tài chính...
          </div>
        }
      >
        <ToolsContent />
      </Suspense>
    </AppShell>
  );
}
