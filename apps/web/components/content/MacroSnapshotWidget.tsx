'use client';

import React from 'react';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

const MACRO_INDICATORS = [
  {
    key: 'fedRate',
    label: 'Lãi suất Fed (Funds Rate)',
    value: '4.75 - 5.00%',
    change: '-0.25%',
    isDown: true,
    note: 'Cắt giảm 25 bps',
  },
  {
    key: 'dxyIndex',
    label: 'Chỉ số Dollar (DXY)',
    value: '101.15',
    change: '-0.35%',
    isDown: true,
    note: 'Áp lực giảm',
  },
  {
    key: 'us10y',
    label: 'Lợi suất Trái phiếu Mỹ 10Y',
    value: '3.82%',
    change: '-0.04%',
    isDown: true,
    note: 'Đường cong phẳng',
  },
  {
    key: 'usdVnd',
    label: 'Tỷ giá USD/VND (Liên NH)',
    value: '25,110',
    change: '-20 VND',
    isDown: true,
    note: 'Hạ nhiệt',
  },
  {
    key: 'oilBrent',
    label: 'Dầu thô Brent (USD/thùng)',
    value: '$73.80',
    change: '+1.45%',
    isDown: false,
    note: 'Phục hồi',
  },
];

export function MacroSnapshotWidget() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading font-bold text-base">
          <Activity className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('macro.macroSnapshot')}</span>
        </div>
        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
          LIVE
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {MACRO_INDICATORS.map((indicator) => (
          <div key={indicator.key} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {indicator.label}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {indicator.note}
              </span>
            </div>

            <div className="flex flex-col items-end shrink-0 font-mono">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {indicator.value}
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  indicator.isDown
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {indicator.isDown ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {indicator.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
