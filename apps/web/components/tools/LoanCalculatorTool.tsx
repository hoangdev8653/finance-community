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
  } = result;

  const interestRatio = totalPrincipal > 0 ? (totalInterest / totalPrincipal) * 100 : 0;
  const maxYearlyPaid = Math.max(...yearlySchedule.map((y) => y.totalPaid), 1);

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
            <p className="text-sm text-muted-foreground">
              Lập kế hoạch trả nợ an toàn, so sánh dư nợ giảm dần vs trả góp đều.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Gói vay mẫu:</span>
          <button
            type="button"
            onClick={() => applyPreset(2000000000, 20, 8.5)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Building className="h-3 w-3 text-primary" /> Mua nhà 2 tỷ (20 năm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(600000000, 5, 9.5)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Car className="h-3 w-3 text-emerald-600" /> Mua ô tô 600tr (5 năm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(100000000, 2, 12)}
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <CreditCard className="h-3 w-3 text-amber-600" /> Tiêu dùng 100tr (2 năm)
          </button>
        </div>
      </div>

      {/* Repayment Method Switcher */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
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
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
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
          <div className="flex items-center justify-between text-xs font-medium text-primary">
            <span>{method === 'REDUCING_BALANCE' ? 'Trả tháng đầu tiên' : 'Trả cố định mỗi tháng'}</span>
            <Percent className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            {formatMoney(monthlyPaymentFirst)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {method === 'REDUCING_BALANCE'
              ? `Tháng cuối: ${formatMoney(monthlyPaymentMin)}`
              : 'Cố định cả gốc và lãi'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tổng số tiền gốc</span>
            <Building className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {formatMoney(totalPrincipal)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Số tiền thực vay</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-amber-600">
            <span>Tổng tiền lãi phải trả</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 sm:text-3xl">
            {formatMoney(totalInterest)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bằng {Math.round(interestRatio)}% tiền gốc ban đầu
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tổng gốc + lãi</span>
            <Calendar className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {formatMoney(totalPayment)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Tổng chi phí sau {years} năm</p>
        </div>
      </div>

      {/* Visual Chart of Principal vs Interest by Year */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Tiến trình trả nợ gốc & lãi qua các năm
            </h3>
            <p className="text-xs text-muted-foreground">
              Tỷ trọng tiền lãi sẽ giảm dần theo thời gian khi dư nợ gốc được thanh toán.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-primary" />
              <span>Tiền gốc trả</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-amber-500" />
              <span>Tiền lãi vay</span>
            </div>
          </div>
        </div>

        {/* Stacked Bars */}
        <div className="mt-6 flex h-60 items-end gap-1.5 pt-4 pb-2 overflow-x-auto">
          {yearlySchedule.map((y) => {
            const heightPercent = Math.max(6, (y.totalPaid / maxYearlyPaid) * 100);
            const principalPercent = (y.principalPaid / y.totalPaid) * 100;

            return (
              <div
                key={y.year}
                className="group relative flex flex-1 flex-col justify-end h-full min-w-[14px]"
                title={`Năm ${y.year}: Gốc ${formatMoney(y.principalPaid)}, Lãi ${formatMoney(y.interestPaid)}, Còn nợ ${formatMoney(y.remainingBalance)}`}
              >
                <div
                  className="w-full rounded-t-md overflow-hidden flex flex-col justify-end opacity-90 transition hover:opacity-100"
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Top: Interest portion */}
                  <div
                    className="w-full bg-amber-500 transition-colors"
                    style={{ height: `${100 - principalPercent}%` }}
                  />
                  {/* Bottom: Principal portion */}
                  <div
                    className="w-full bg-primary transition-colors"
                    style={{ height: `${principalPercent}%` }}
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

      {/* Schedule Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Lịch trình trả nợ chi tiết</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {years * 12} kỳ thanh toán hàng tháng
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 sm:px-6">Kỳ hạn</th>
                <th className="px-4 py-3 sm:px-6">Gốc trả</th>
                <th className="px-4 py-3 sm:px-6">Lãi trả</th>
                <th className="px-4 py-3 sm:px-6">Tổng gốc + lãi</th>
                <th className="px-4 py-3 text-right sm:px-6">Dư nợ còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
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
                      <td className="whitespace-nowrap px-4 py-3 text-foreground sm:px-6">
                        {formatMoney(item.principalPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-amber-600 sm:px-6">
                        {formatMoney(item.interestPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-primary sm:px-6">
                        {formatMoney(item.totalPaid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground sm:px-6">
                        {formatMoney(item.remainingBalance)}
                      </td>
                    </tr>

                    {/* Expandable monthly breakdown */}
                    {isExpanded && (
                      <tr className="bg-muted/10">
                        <td colSpan={5} className="p-0">
                          <div className="p-3 sm:px-8 border-y border-border/60 bg-muted/15 space-y-1">
                            <p className="font-sans text-xs font-semibold text-muted-foreground pb-1">
                              Chi tiết 12 tháng trong Năm {item.year}:
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 text-[11px]">
                              {item.months.map((m) => (
                                <div
                                  key={m.month}
                                  className="rounded-lg border border-border/80 bg-background/80 p-2 space-y-1"
                                >
                                  <div className="flex justify-between font-sans font-bold text-foreground">
                                    <span>Tháng {m.month}</span>
                                  </div>
                                  <div className="text-muted-foreground">
                                    Trả: <strong className="text-primary">{formatMoney(m.totalMonthlyPayment)}</strong>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground/80">
                                    Gốc: {formatMoney(m.principalPayment)}
                                  </div>
                                  <div className="text-[10px] text-amber-600/90">
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
