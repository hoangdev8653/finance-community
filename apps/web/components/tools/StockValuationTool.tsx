'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3, Calculator, CircleHelp, RotateCcw, ShieldCheck, TrendingUp } from 'lucide-react';
import { calculateGordonValue, calculateMarginOfSafety, calculatePeValue } from '@/lib/tools/financial-calculations';
import { ToolSliderInput } from './ToolSliderInput';

const formatMoney = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.max(0, value));
const currency = (value: number) => `${formatMoney(value)} ₫`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">{children}<CircleHelp aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" /></span>;
}

export function StockValuationTool() {
  const [valuationMode, setValuationMode] = useState<'PE' | 'GORDON'>('PE');
  const [eps, setEps] = useState(6500);
  const [peMultiple, setPeMultiple] = useState(15);
  const [currentPrice, setCurrentPrice] = useState(85000);
  const [marginPercent, setMarginPercent] = useState(20);
  const [dividend, setDividend] = useState(4000);
  const [growth, setGrowth] = useState(6);
  const [requiredReturn, setRequiredReturn] = useState(13);
  const fairValue = useMemo(() => valuationMode === 'PE' ? calculatePeValue(eps, peMultiple) : calculateGordonValue(dividend, growth, requiredReturn), [dividend, eps, growth, peMultiple, requiredReturn, valuationMode]);
  const safeBuyPrice = useMemo(() => calculateMarginOfSafety(fairValue, marginPercent), [fairValue, marginPercent]);
  const upside = fairValue > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : 0;
  const remainingMargin = fairValue > 0 ? Math.max(0, ((fairValue - currentPrice) / fairValue) * 100) : 0;
  const positionLabel = currentPrice <= fairValue ? 'Định giá hợp lý' : 'Giá cao hơn giá trị thực';
  const currentPricePosition = fairValue > safeBuyPrice ? Math.min(100, Math.max(0, ((currentPrice - safeBuyPrice) / (fairValue - safeBuyPrice)) * 100)) : 50;

  const reset = () => { setEps(6500); setPeMultiple(15); setCurrentPrice(85000); setMarginPercent(20); setDividend(4000); setGrowth(6); setRequiredReturn(13); };

  return (
    <section aria-label="Công cụ định giá cổ phiếu" className="grid gap-4 lg:grid-cols-[1.38fr_1fr]">
      <div className="rounded-[10px] border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><BarChart3 aria-hidden="true" className="h-5 w-5" /></div><div><h2 className="text-base font-extrabold text-foreground">Thông số định giá</h2><p className="text-[11px] text-muted-foreground">Nhập các giả định để ước tính giá trị hợp lý của cổ phiếu</p></div></div>
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-[11px] font-semibold dark:bg-muted"><button type="button" aria-pressed={valuationMode === 'PE'} onClick={() => setValuationMode('PE')} className={`min-h-8 rounded-md px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${valuationMode === 'PE' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>P/E & Biên an toàn</button><button type="button" aria-pressed={valuationMode === 'GORDON'} onClick={() => setValuationMode('GORDON')} className={`min-h-8 rounded-md px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${valuationMode === 'GORDON' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Mô hình Gordon</button></div>
        </div>
        {valuationMode === 'PE' ? <div className="grid gap-x-5 gap-y-5 py-5 sm:grid-cols-2 xl:grid-cols-4"><ToolSliderInput label={<FieldLabel>EPS dự phóng</FieldLabel>} value={eps} onChange={setEps} min={500} max={50000} step={500} suffix="₫" formatAsCurrency /><ToolSliderInput label={<FieldLabel>P/E mục tiêu</FieldLabel>} value={peMultiple} onChange={setPeMultiple} min={3} max={40} step={0.5} suffix="lần" /><ToolSliderInput label={<FieldLabel>Thị giá hiện tại</FieldLabel>} value={currentPrice} onChange={setCurrentPrice} min={1000} max={300000} step={500} suffix="₫" formatAsCurrency /><ToolSliderInput label={<FieldLabel>Biên an toàn</FieldLabel>} value={marginPercent} onChange={setMarginPercent} min={5} max={50} step={5} suffix="%" /></div> : <div className="grid gap-x-5 gap-y-5 py-5 sm:grid-cols-3"><ToolSliderInput label={<FieldLabel>Cổ tức dự kiến (D₁)</FieldLabel>} value={dividend} onChange={setDividend} min={500} max={30000} step={500} suffix="₫" formatAsCurrency /><ToolSliderInput label={<FieldLabel>Tăng trưởng dài hạn</FieldLabel>} value={growth} onChange={setGrowth} min={1} max={20} step={0.5} suffix="%" /><ToolSliderInput label={<FieldLabel>Tỷ suất sinh lời (r)</FieldLabel>} value={requiredReturn} onChange={setRequiredReturn} min={Math.max(2, growth + 0.5)} max={30} step={0.5} suffix="%" /></div>}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4"><button type="button" onClick={reset} className="inline-flex min-h-10 min-w-36 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-muted dark:text-muted-foreground sm:min-w-44"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Đặt lại</button><button type="button" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-80"><Calculator aria-hidden="true" className="h-4 w-4" /> Tính định giá</button></div>
      </div>
      <div className="rounded-[10px] border border-border bg-card p-4 shadow-card sm:p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-extrabold text-foreground">Kết quả định giá</h2><p className="text-[11px] text-muted-foreground">Dựa trên các thông số bạn đã nhập</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {positionLabel}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-3"><ResultCard title="Giá trị hợp lý (Fair Value)" value={currency(fairValue)} description={valuationMode === 'PE' ? `Bằng EPS (${formatMoney(eps)} ₫) × P/E (${peMultiple})` : 'Theo mô hình chiết khấu cổ tức'} /><ResultCard green title={`Giá mua an toàn (-${marginPercent}%)`} value={currency(safeBuyPrice)} description="Điểm mua lý tưởng theo Benjamin Graham" /></div>
        <div className="mt-3"><div className="grid grid-cols-3 text-center text-[13px] font-extrabold text-slate-800 dark:text-slate-100"><span className="text-emerald-700 dark:text-emerald-300">{currency(safeBuyPrice)}<small className="mt-1 block text-[12px] font-semibold text-slate-700 dark:text-slate-200">Giá mua an toàn</small></span><span className="text-foreground">{currency(currentPrice)}<small className="mt-1 block text-[12px] font-semibold text-slate-700 dark:text-slate-200">Thị giá hiện tại</small></span><span className="text-emerald-700 dark:text-emerald-300">{currency(fairValue)}<small className="mt-1 block text-[12px] font-semibold text-slate-700 dark:text-slate-200">Giá trị hợp lý</small></span></div><div className="relative mt-3 h-2 rounded-full bg-slate-200 dark:bg-muted"><div className="absolute inset-y-0 left-0 w-1/3 rounded-l-full bg-emerald-300" /><div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-200" /><span aria-label="Thị giá hiện tại" className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow-sm" style={{ left: `${33 + currentPricePosition / 3}%` }} /></div><div className="mt-2 grid grid-cols-3 text-center text-[12px] font-semibold text-slate-700 dark:text-slate-200"><span>Vùng mua an toàn</span><span className="text-amber-700 dark:text-amber-400">Vùng theo dõi</span><span>Vùng định giá cao</span></div></div>
        <div className="mt-4 grid grid-cols-2 gap-3"><MetricCard icon={<TrendingUp aria-hidden="true" className="h-5 w-5" />} label="Upside tiềm năng" value={`${upside >= 0 ? '+' : ''}${upside.toFixed(1).replace('.', ',')}%`} description="So với thị giá hiện tại" /><MetricCard icon={<ShieldCheck aria-hidden="true" className="h-5 w-5" />} label="Biên an toàn còn lại" value={`${remainingMargin.toFixed(0)}%`} description="Thị giá đang thấp hơn giá trị thực" /></div>
      </div>
    </section>
  );
}

function ResultCard({ title, value, description, green = false }: { title: string; value: string; description: string; green?: boolean }) { return <div className={`rounded-[10px] border p-3 ${green ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25' : 'border-border bg-background'}`}><p className="text-[11px] font-bold leading-4 text-muted-foreground">{title}</p><p className={`mt-1 text-2xl font-extrabold tracking-tight ${green ? 'text-emerald-600' : 'text-foreground'}`}>{value}</p><p className="mt-0.5 text-[10px] leading-3 text-muted-foreground">{description}</p></div>; }
function MetricCard({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: string; description: string }) { return <div className="flex gap-2 rounded-[10px] border border-border bg-background p-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{icon}</div><div><p className="text-[10px] font-semibold text-muted-foreground">{label}</p><p className="text-lg font-extrabold text-emerald-600">{value}</p><p className="text-[9px] leading-3 text-muted-foreground">{description}</p></div></div>; }
