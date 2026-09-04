'use client';

import React, { useState, useMemo } from 'react';
import {
  calculatePeValue,
  calculateGordonValue,
  calculateMarginOfSafety,
} from '@/lib/tools/financial-calculations';
import { ToolSliderInput } from './ToolSliderInput';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

const formatMoney = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, val));

export function StockValuationTool() {
  const [valuationMode, setValuationMode] = useState<'PE' | 'GORDON'>('PE');

  // P/E State
  const [eps, setEps] = useState(6500); // 6,500đ (ví dụ FPT hoặc HPG)
  const [peMultiple, setPeMultiple] = useState(15); // P/E 15 lần
  const [currentPrice, setCurrentPrice] = useState(85000); // 85,000đ
  const [marginPercent, setMarginPercent] = useState(20); // 20% biên an toàn

  // Gordon State
  const [dividend, setDividend] = useState(4000); // 4,000đ/cổ phiếu
  const [growth, setGrowth] = useState(6); // 6% tăng trưởng
  const [requiredReturn, setRequiredReturn] = useState(13); // 13% tỷ suất sinh lời đòi hỏi

  // Calculations
  const fairValuePe = useMemo(() => calculatePeValue(eps, peMultiple), [eps, peMultiple]);
  const safeBuyPrice = useMemo(
    () => calculateMarginOfSafety(fairValuePe, marginPercent),
    [fairValuePe, marginPercent],
  );

  const gordonValue = useMemo(
    () => calculateGordonValue(dividend, growth, requiredReturn),
    [dividend, growth, requiredReturn],
  );

  // Status for P/E
  const peValuationStatus = useMemo(() => {
    if (fairValuePe <= 0) return { label: 'Chưa đủ dữ liệu', color: 'neutral', desc: '' };
    if (currentPrice <= safeBuyPrice) {
      return {
        label: 'Rất hấp dẫn (Dưới biên an toàn)',
        badgeVariant: 'success',
        color: 'emerald',
        desc: `Thị giá thấp hơn cả mức giá mua an toàn (${formatMoney(safeBuyPrice)}). Cơ hội tích sản giá hời.`,
      };
    }
    if (currentPrice <= fairValuePe) {
      return {
        label: 'Định giá hợp lý',
        badgeVariant: 'outline',
        color: 'blue',
        desc: `Thị giá nằm trong vùng giá trị thực (${formatMoney(fairValuePe)}), biên an toàn còn lại ${Math.round(((fairValuePe - currentPrice) / fairValuePe) * 100)}%.`,
      };
    }
    return {
      label: 'Định giá cao hơn giá trị thực',
      badgeVariant: 'danger',
      color: 'rose',
      desc: `Thị giá cao hơn giá trị hợp lý ${Math.round(((currentPrice - fairValuePe) / fairValuePe) * 100)}%. Nên kiên nhẫn chờ điều chỉnh.`,
    };
  }, [currentPrice, fairValuePe, safeBuyPrice]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Định giá cổ phiếu & Cổ tức
            </h2>
            <p className="text-sm text-muted-foreground">
              Ước tính giá trị hợp lý của doanh nghiệp và tính toán biên an toàn (Margin of Safety).
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setValuationMode('PE')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              valuationMode === 'PE'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Định giá P/E & Biên an toàn
          </button>
          <button
            type="button"
            onClick={() => setValuationMode('GORDON')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              valuationMode === 'GORDON'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mô hình Gordon (Cổ tức)
          </button>
        </div>
      </div>

      {valuationMode === 'PE' ? (
        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 md:grid-cols-2 lg:grid-cols-4">
            <ToolSliderInput
              label="EPS dự phóng"
              value={eps}
              onChange={setEps}
              min={500}
              max={50000}
              step={500}
              suffix="₫"
              formatAsCurrency
              helperText="Lợi nhuận sau thuế / 1 cổ phiếu"
            />

            <ToolSliderInput
              label="P/E mục tiêu"
              value={peMultiple}
              onChange={setPeMultiple}
              min={3}
              max={40}
              step={0.5}
              suffix="lần"
              helperText="P/E trung bình ngành / lịch sử"
            />

            <ToolSliderInput
              label="Thị giá hiện tại"
              value={currentPrice}
              onChange={setCurrentPrice}
              min={1000}
              max={300000}
              step={500}
              suffix="₫"
              formatAsCurrency
              helperText="Giá khớp lệnh trên sàn"
            />

            <ToolSliderInput
              label="Biên an toàn (Margin of Safety)"
              value={marginPercent}
              onChange={setMarginPercent}
              min={5}
              max={50}
              step={5}
              suffix="%"
              helperText="Chiết khấu phòng ngừa rủi ro"
            />
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">Giá trị hợp lý (Fair Value)</span>
              <p className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
                {formatMoney(fairValuePe)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Bằng EPS ({formatMoney(eps)}) × P/E ({peMultiple})</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xs">
              <span className="text-xs font-medium text-emerald-600">Giá mua an toàn (-{marginPercent}%)</span>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600 sm:text-3xl">
                {formatMoney(safeBuyPrice)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Điểm mua lý tưởng theo Benjamin Graham</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">Đánh giá vị thế</span>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold text-lg text-foreground">{peValuationStatus.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {peValuationStatus.desc}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gordon Inputs */}
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 md:grid-cols-3">
            <ToolSliderInput
              label="Cổ tức tiền mặt dự kiến (D₁)"
              value={dividend}
              onChange={setDividend}
              min={500}
              max={30000}
              step={500}
              suffix="₫"
              formatAsCurrency
              helperText="Cổ tức nhận trong 12 tháng tới"
            />

            <ToolSliderInput
              label="Tăng trưởng cổ tức dài hạn (g)"
              value={growth}
              onChange={setGrowth}
              min={1}
              max={20}
              step={0.5}
              suffix="%"
              helperText="Tốc độ tăng trưởng cổ tức hằng năm"
            />

            <ToolSliderInput
              label="Tỷ suất sinh lời đòi hỏi (r)"
              value={requiredReturn}
              onChange={setRequiredReturn}
              min={Math.max(2, growth + 0.5)}
              max={30}
              step={0.5}
              suffix="%"
              helperText="Phải lớn hơn tốc độ tăng trưởng (r > g)"
            />
          </div>

          {/* Gordon Results */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
              <span className="text-xs font-medium text-primary">Giá trị nội tại theo dòng cổ tức</span>
              <p className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                {gordonValue > 0 ? formatMoney(gordonValue) : 'Không hợp lệ (r ≤ g)'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Công thức Gordon Growth: P₀ = D₁ × (1 + g) / (r - g)
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">Nguyên tắc áp dụng</span>
              <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                Mô hình này đặc biệt phù hợp với các doanh nghiệp trả cổ tức tiền mặt đều đặn qua nhiều năm (như Điện, Nước, Dược phẩm, Tiêu dùng thiết yếu).
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Mô hình chỉ có giá trị khi Tỷ suất đòi hỏi (r) lớn hơn Tăng trưởng (g).</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
