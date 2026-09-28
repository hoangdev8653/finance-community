'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateLoanSchedule,
  LoanMethod,
  LoanYearItem,
} from '@/lib/tools/financial-calculations';
import { ToolSliderInput } from './ToolSliderInput';
import { Button } from '@/components/ui/Button';
import {
  Building,
  Car,
  CreditCard,
  Percent,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const formatMoney = (val: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, val));

export function LoanCalculatorTool() {
  const [principal, setPrincipal] = useState(1000000000); // 1 tỷ
  const [years, setYears] = useState(15); // 15 năm
  const [rate, setRate] = useState(8.5); // 8.5%
  const [method, setMethod] = useState<LoanMethod>('REDUCING_BALANCE');
  const [showAllYears, setShowAllYears] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const result = useMemo(
    () => calculateLoanSchedule(principal, rate, years, method),
    [principal, rate, years, method],
  );

  const {
    monthlyPaymentFirst,
    monthlyPaymentMin,
    monthlyPaymentMax,
    totalPrincipal,
    totalInterest,
    totalPayment,
    yearlySchedule,
    monthlySchedule,
  } = result;

  const interestRatio = totalPrincipal > 0 ? (totalInterest / totalPrincipal) * 100 : 0;
  const displayedMonths = monthlySchedule.slice(0, 24);
  const maxMonthlyPayment = Math.max(...displayedMonths.map((month) => month.totalMonthlyPayment), 1);
  const formatChartValue = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(value));
  const firstInterest = displayedMonths[0]?.interestPayment ?? 0;
  const lastDisplayedInterest = displayedMonths.at(-1)?.interestPayment ?? 0;
  const interestReduction = firstInterest > 0 ? ((firstInterest - lastDisplayedInterest) / firstInterest) * 100 : 0;
  const chartDescription = method === 'REDUCING_BALANCE'
    ? `24 kỳ đầu: tiền gốc trả cố định, tiền lãi giảm ${Math.round(interestReduction)}% theo dư nợ.`
    : `24 kỳ đầu: tiền gốc tăng dần, tiền lãi giảm ${Math.round(interestReduction)}% theo dư nợ.`;

  const applyPreset = (pPrincipal: number, pYears: number, pRate: number) => {
    setPrincipal(pPrincipal);
    setYears(pYears);
    setRate(pRate);
  };

  const displayedYears = showAllYears ? yearlySchedule : yearlySchedule.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header & Presets */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Tính lãi vay ngân hàng (Mua nhà / xe)
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Lập kế hoạch trả nợ an toàn, so sánh dư nợ giảm dần vs trả góp đều.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Gói vay mẫu:</span>
          <button
            type="button"
            onClick={() => applyPreset(2000000000, 20, 8.5)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            <Building className="h-3 w-3 text-primary" /> Mua nhà 2 tỷ (20 năm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(600000000, 5, 9.5)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            <Car className="h-3 w-3 text-emerald-600" /> Mua ô tô 600tr (5 năm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(100000000, 2, 12)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            <CreditCard className="h-3 w-3 text-amber-600" /> Tiêu dùng 100tr (2 năm)
          </button>
        </div>
      </div>

      {/* Repayment Method Switcher */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Phương thức tính lãi
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod('REDUCING_BALANCE')}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              method === 'REDUCING_BALANCE'
                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                method === 'REDUCING_BALANCE'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              }`}
            >
              {method === 'REDUCING_BALANCE' && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              )}
            </span>
            <div>
              <p className="font-bold text-foreground">Dư nợ giảm dần (Phổ biến)</p>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground leading-relaxed">
                Tiền gốc chia đều hàng tháng, lãi tính trên số tiền nợ thực tế còn lại. Tiền trả mỗi tháng giảm dần.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('FIXED_PAYMENT')}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              method === 'FIXED_PAYMENT'
                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
            }`}
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                method === 'FIXED_PAYMENT'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              }`}
            >
              {method === 'FIXED_PAYMENT' && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              )}
            </span>
            <div>
              <p className="font-bold text-foreground">Trả góp đều (Niên kim cố định)</p>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground leading-relaxed">
                Tổng số tiền trả (gốc + lãi) cố định bằng nhau mỗi tháng, giúp người vay dễ chủ động ngân sách chi tiêu.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 md:grid-cols-3">
        <ToolSliderInput
          label="Số tiền cần vay"
          value={principal}
          onChange={setPrincipal}
          min={50000000} // 50 triệu
          max={10000000000} // 10 tỷ
          step={50000000}
          suffix="₫"
          formatAsCurrency
          helperText="Khoản tiền vay từ ngân hàng"
        />

        <ToolSliderInput
          label="Thời hạn vay"
          value={years}
          onChange={setYears}
          min={1}
          max={35}
          step={1}
          suffix="năm"
          helperText={`${years * 12} tháng`}
        />

        <ToolSliderInput
          label="Lãi suất vay"
          value={rate}
          onChange={setRate}
          min={3}
          max={20}
          step={0.1}
          suffix="%"
          helperText="Lãi suất hàng năm (%/năm)"
        />
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
          <div className="flex items-center justify-between text-sm font-semibold text-primary">
            <span>{method === 'REDUCING_BALANCE' ? 'Trả tháng đầu tiên' : 'Trả cố định mỗi tháng'}</span>
            <Percent className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            {formatMoney(monthlyPaymentFirst)}
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {method === 'REDUCING_BALANCE'
              ? `Tháng cuối: ${formatMoney(monthlyPaymentMin)}`
              : 'Cố định cả gốc và lãi'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
            <span>Tổng số tiền gốc</span>
            <Building className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {formatMoney(totalPrincipal)}
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Số tiền thực vay</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between text-sm font-semibold text-amber-600">
            <span>Tổng tiền lãi phải trả</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 sm:text-3xl">
            {formatMoney(totalInterest)}
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Bằng {Math.round(interestRatio)}% tiền gốc ban đầu
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
            <span>Tổng chi phí vay</span>
            <Calendar className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {formatMoney(totalPayment)}
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Tổng tiền phải thanh toán sau {years} năm</p>
        </div>
      </div>

      {/* Visual Chart of Principal vs Interest by Payment Period */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Tiến trình trả nợ gốc & lãi qua các kỳ thanh toán
            </h3>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{chartDescription}</p>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-primary" />
              <span>{method === 'REDUCING_BALANCE' ? 'Tiền gốc trả cố định' : 'Tiền gốc trả'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-amber-500" />
              <span>Tiền lãi vay</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[68px_minmax(0,1fr)] gap-3">
          <div className="flex h-52 flex-col justify-between pb-6 text-right text-sm font-bold text-slate-700 dark:text-slate-200">
            {[maxMonthlyPayment, maxMonthlyPayment * 0.75, maxMonthlyPayment * 0.5, maxMonthlyPayment * 0.25, 0].map((value) => <span key={value}>{formatChartValue(value)} ₫</span>)}
          </div>
          <div className="min-w-0">
            <div className="relative h-52 border-b border-l border-border bg-[linear-gradient(to_bottom,transparent_24.5%,rgb(226_232_240/.8)_25%,transparent_25.5%,transparent_49.5%,rgb(226_232_240/.8)_50%,transparent_50.5%,transparent_74.5%,rgb(226_232_240/.8)_75%,transparent_75.5%)] dark:bg-[linear-gradient(to_bottom,transparent_24.5%,rgb(51_65_85/.8)_25%,transparent_25.5%,transparent_49.5%,rgb(51_65_85/.8)_50%,transparent_50.5%,transparent_74.5%,rgb(51_65_85/.8)_75%,transparent_75.5%)]">
              <div className="absolute inset-x-2 bottom-0 top-3 grid items-end gap-1" style={{ gridTemplateColumns: `repeat(${displayedMonths.length}, minmax(0, 1fr))` }}>
                {displayedMonths.map((month) => {
                  const heightPercent = Math.max(5, (month.totalMonthlyPayment / maxMonthlyPayment) * 100);
                  const principalPercent = month.totalMonthlyPayment > 0 ? (month.principalPayment / month.totalMonthlyPayment) * 100 : 0;
                  return <div key={month.month} className="group flex h-full min-w-0 items-end" title={`Kỳ ${month.month}: Gốc ${formatMoney(month.principalPayment)}, lãi ${formatMoney(month.interestPayment)}`}><div className="relative w-full overflow-hidden rounded-t-sm transition-opacity group-hover:opacity-85" style={{ height: `${heightPercent}%` }}><div className="absolute inset-x-0 top-0 bg-amber-500" style={{ height: `${100 - principalPercent}%` }} /><div className="absolute inset-x-0 bottom-0 bg-primary" style={{ height: `${principalPercent}%` }} /></div></div>;
                })}
              </div>
            </div>
            <div className="mt-2 grid gap-1 px-2 text-center font-mono text-sm font-bold text-slate-700 dark:text-slate-200" style={{ gridTemplateColumns: `repeat(${displayedMonths.length}, minmax(0, 1fr))` }}>{displayedMonths.map((month) => <span key={month.month}>{month.month}</span>)}</div>
            <p className="mt-3 text-center text-sm font-bold text-slate-700 dark:text-slate-200">Kỳ thanh toán (tháng)</p>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lịch trình trả nợ chi tiết</h3>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {years * 12} kỳ thanh toán hàng tháng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="border-b border-border bg-muted/40 text-[15px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 sm:px-6">Kỳ hạn</th>
                <th className="px-4 py-3 sm:px-6">Gốc trả</th>
                <th className="px-4 py-3 sm:px-6">Lãi trả</th>
                <th className="px-4 py-3 sm:px-6">Tổng gốc + lãi</th>
                <th className="px-4 py-3 text-right sm:px-6">Dư nợ còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans text-base font-semibold text-slate-900 dark:text-slate-100">
              {displayedYears.map((item) => {
                const isExpanded = expandedYear === item.year;

                return (
                  <React.Fragment key={item.year}>
                    <tr
                      onClick={() => setExpandedYear(isExpanded ? null : item.year)}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-sans font-semibold text-foreground sm:px-6 flex items-center gap-1.5">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        Năm {item.year}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground sm:px-6">
                        {formatMoney(item.principalPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-amber-600 sm:px-6">
                        {formatMoney(item.interestPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-primary sm:px-6">
                        {formatMoney(item.totalPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground sm:px-6">
                        {formatMoney(item.remainingBalance)}
                      </td>
                    </tr>

                    {/* Expandable monthly breakdown */}
                    {isExpanded && (
                      <tr className="bg-muted/10">
                        <td colSpan={5} className="p-0">
                          <div className="p-3 sm:px-8 border-y border-border/60 bg-muted/15 space-y-1">
                            <p className="font-sans text-sm font-bold text-slate-700 dark:text-slate-200 pb-1">
                              Chi tiết 12 tháng trong Năm {item.year}:
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 text-[13px] font-medium text-slate-700 dark:text-slate-200">
                              {item.months.map((m) => (
                                <div
                                  key={m.month}
                                  className="rounded-lg border border-border/80 bg-background/80 p-2 space-y-1"
                                >
                                  <div className="flex justify-between font-sans font-bold text-foreground">
                                    <span>Tháng {m.month}</span>
                                  </div>
                                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                                    Trả: <strong className="text-primary">{formatMoney(m.totalMonthlyPayment)}</strong>
                                  </div>
                                  <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                                    Gốc: {formatMoney(m.principalPayment)}
                                  </div>
                                  <div className="text-[12px] font-medium text-amber-700 dark:text-amber-400">
                                    Lãi: {formatMoney(m.interestPayment)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {yearlySchedule.length > 5 && (
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
