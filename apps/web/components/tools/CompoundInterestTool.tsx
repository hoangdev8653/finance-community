'use client';

import React, { useState, useMemo } from 'react';
import { calculateCompoundInterest, CompoundYear } from '@/lib/tools/financial-calculations';
import { ToolSliderInput } from './ToolSliderInput';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  Coins,
  PiggyBank,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PieChart,
  Calendar,
} from 'lucide-react';

const formatMoney = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, val));

export function CompoundInterestTool() {
  const [initial, setInitial] = useState(100000000); // 100 triệu
  const [monthly, setMonthly] = useState(5000000); // 5 triệu
  const [rate, setRate] = useState(10); // 10%
  const [years, setYears] = useState(10); // 10 năm
  const [showAllYears, setShowAllYears] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<CompoundYear | null>(null);

  const result = useMemo(
    () => calculateCompoundInterest(initial, monthly, rate, years),
    [initial, monthly, rate, years],
  );

  const { finalBalance, totalContributed, totalInterest, yearly } = result;
  const roi = totalContributed > 0 ? (totalInterest / totalContributed) * 100 : 0;
  const maxBalance = Math.max(...yearly.map((y) => y.balance), 1);

  const applyPreset = (pInitial: number, pMonthly: number, pRate: number, pYears: number) => {
    setInitial(pInitial);
    setMonthly(pMonthly);
    setRate(pRate);
    setYears(pYears);
  };

  const displayedYears = showAllYears ? yearly : yearly.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header & Presets */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Lãi kép & Kế hoạch tích lũy
            </h2>
            <p className="text-sm text-muted-foreground">
              Sức mạnh của kỳ quan thứ 8: Ước tính sự bùng nổ tài sản theo thời gian.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Gợi ý nhanh:</span>
          <button
            type="button"
            onClick={() => applyPreset(50000000, 5000000, 10, 20)}
            className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            Hưu trí 20 năm
          </button>
          <button
            type="button"
            onClick={() => applyPreset(200000000, 15000000, 8, 5)}
            className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            Mua nhà 5 năm
          </button>
          <button
            type="button"
            onClick={() => applyPreset(20000000, 3000000, 9, 15)}
            className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            Quỹ học vấn 15 năm
          </button>
        </div>
      </div>

      {/* Input Sliders Grid */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 md:grid-cols-2">
        <ToolSliderInput
          label="Vốn ban đầu"
          value={initial}
          onChange={setInitial}
          min={0}
          max={2000000000} // 2 tỷ
          step={5000000}
          suffix="₫"
          formatAsCurrency
          helperText="Số tiền có sẵn hiện tại"
        />

        <ToolSliderInput
          label="Tích lũy đều mỗi tháng"
          value={monthly}
          onChange={setMonthly}
          min={0}
          max={50000000} // 50 triệu
          step={500000}
          suffix="₫"
          formatAsCurrency
          helperText="Số tiền trích ra đầu tư hằng tháng"
        />

        <ToolSliderInput
          label="Lãi suất kỳ vọng hàng năm"
          value={rate}
          onChange={setRate}
          min={1}
          max={30}
          step={0.5}
          suffix="%"
          helperText="Ví dụ: Tiết kiệm 5-6%, Cổ phiếu 10-15%"
        />

        <ToolSliderInput
          label="Thời gian tích lũy"
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          step={1}
          suffix="năm"
          helperText="Đầu tư càng lâu, lãi kép càng mạnh"
        />
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-primary">
            <span>Tổng tài sản dự kiến</span>
            <Coins className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            {formatMoney(finalBalance)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Sau {years} năm tích lũy liên tục</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tổng vốn tự có đã góp</span>
            <PiggyBank className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {formatMoney(totalContributed)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round((totalContributed / (finalBalance || 1)) * 100)}% tổng tài sản
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-600">
            <span>Tiền lãi sinh sôi</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">
            +{formatMoney(totalInterest)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.round((totalInterest / (finalBalance || 1)) * 100)}% tổng tài sản
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tỷ suất sinh lời (ROI)</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            +{Math.round(roi)}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lợi nhuận trên tổng vốn nộp</p>
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Biểu đồ tăng trưởng tài sản theo năm
            </h3>
            <p className="text-xs text-muted-foreground">
              Rê chuột vào từng cột để xem chi tiết Vốn gốc & Tiền lãi tích lũy.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-muted-foreground/40" />
              <span>Tiền vốn đã nộp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-primary" />
              <span>Tiền lãi sinh sôi</span>
            </div>
          </div>
        </div>

        {/* Hover info tooltip bar */}
        <div className="mt-4 min-h-[32px] rounded-lg bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
          {hoveredYear ? (
            <>
              <span className="font-semibold text-foreground">
                Năm thứ {hoveredYear.year}:
              </span>
              <span>Vốn nộp: <strong className="text-foreground">{formatMoney(hoveredYear.contributed)}</strong></span>
              <span>Tiền lãi: <strong className="text-emerald-600">{formatMoney(hoveredYear.interest)}</strong></span>
              <span>Tổng: <strong className="text-primary">{formatMoney(hoveredYear.balance)}</strong></span>
            </>
          ) : (
            <span>Di chuột vào thanh biểu đồ bên dưới để xem từng mốc thời gian</span>
          )}
        </div>

        {/* Stacked Bars */}
        <div className="mt-4 flex h-64 items-end gap-1.5 pt-6 pb-2 overflow-x-auto">
          {yearly.map((y) => {
            const heightPercent = Math.max(6, (y.balance / maxBalance) * 100);
            const contributedPercent = (y.contributed / y.balance) * 100;
            const isHovered = hoveredYear?.year === y.year;

            return (
              <div
                key={y.year}
                onMouseEnter={() => setHoveredYear(y)}
                onMouseLeave={() => setHoveredYear(null)}
                className="group relative flex flex-1 flex-col justify-end h-full cursor-pointer min-w-[14px]"
              >
                <div
                  className={`w-full rounded-t-md overflow-hidden transition-all flex flex-col justify-end ${
                    isHovered ? 'ring-2 ring-primary' : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Top: Interest portion */}
                  <div
                    className="w-full bg-primary transition-colors"
                    style={{ height: `${100 - contributedPercent}%` }}
                  />
                  {/* Bottom: Contributed portion */}
                  <div
                    className="w-full bg-muted-foreground/35 transition-colors"
                    style={{ height: `${contributedPercent}%` }}
                  />
                </div>

                <span className="mt-2 block text-center font-mono text-[10px] text-muted-foreground group-hover:font-bold group-hover:text-foreground">
                  {y.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yearly Breakdown Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Bảng phân bổ dòng tiền từng năm</h3>
          </div>
          <span className="text-xs text-muted-foreground">{years} năm tích lũy</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6">Năm</th>
                <th className="px-4 py-3 sm:px-6">Vốn góp lũy kế</th>
                <th className="px-4 py-3 sm:px-6">Tiền lãi trong năm</th>
                <th className="px-4 py-3 sm:px-6">Tổng lãi lũy kế</th>
                <th className="px-4 py-3 text-right sm:px-6">Tổng tài sản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {displayedYears.map((item, idx) => {
                const prevYear = idx > 0 ? displayedYears[idx - 1] : null;
                const yearlyInterest = prevYear
                  ? Math.max(0, item.interest - prevYear.interest)
                  : item.interest;

                return (
                  <tr key={item.year} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3 font-sans font-semibold text-foreground sm:px-6">
                      Năm {item.year}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground sm:px-6">
                      {formatMoney(item.contributed)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-emerald-600 sm:px-6">
                      +{formatMoney(yearlyInterest)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-emerald-600 sm:px-6">
                      {formatMoney(item.interest)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-foreground sm:px-6">
                      {formatMoney(item.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {yearly.length > 5 && (
          <div className="border-t border-border bg-muted/10 p-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllYears(!showAllYears)}
              className="gap-2 text-xs font-semibold"
            >
              {showAllYears ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Thu gọn danh sách
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Xem toàn bộ {years} năm ({years - 5} năm còn lại)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
