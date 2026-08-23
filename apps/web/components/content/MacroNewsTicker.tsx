'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

const MACRO_FLASH_ITEMS = [
  {
    id: 'flash-1',
    tag: 'FED & LÃI SUẤT',
    title: 'FOMC hạ 25 bps lãi suất cơ bản về vùng 4.75% - 5.00%',
    time: '35 phút trước',
  },
  {
    id: 'flash-2',
    tag: 'TỶ GIÁ & DXY',
    title: 'Chỉ số DXY điều chỉnh về mốc 101.1 sau bài phát biểu của Chủ tịch Powell',
    time: '1 giờ trước',
  },
  {
    id: 'flash-3',
    tag: 'TRÁI PHIẾU MỸ',
    title: 'Lợi suất TPCP Mỹ 10 năm giảm 4 điểm cơ bản xuống 3.82%',
    time: '2 giờ trước',
  },
  {
    id: 'flash-4',
    tag: 'NHNN VIỆT NAM',
    title: 'Áp lực tỷ giá hạ nhiệt, thanh khoản hệ thống liên ngân hàng duy trì trạng thái dồi dào',
    time: '3 giờ trước',
  },
];

export function MacroNewsTicker() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/50 to-slate-900/30 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-slate-900/60 p-2.5 sm:p-3 flex items-center gap-3 overflow-hidden shadow-xs backdrop-blur-xs">
      <div className="shrink-0 flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-heading font-bold text-emerald-400 dark:text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Zap className="h-3.5 w-3.5" />
        <span className="hidden sm:inline whitespace-nowrap">{t('macro.flashBadge')}</span>
        <span className="sm:hidden whitespace-nowrap">VĨ MÔ 24/7</span>
      </div>

      <div className="flex-1 flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5 text-xs sm:text-sm">
        {MACRO_FLASH_ITEMS.map((item, idx) => (
          <Link
            key={item.id}
            href="/posts/community/fixed-income-multiples-monetary-policy-shift"
            className="shrink-0 flex items-center gap-2 text-slate-300 hover:text-white transition-colors group cursor-pointer"
          >
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-400 group-hover:border-emerald-500/50">
              {item.tag}
            </span>
            <span className="font-medium group-hover:underline underline-offset-4 decoration-emerald-500">
              {item.title}
            </span>
            <span className="text-slate-500 text-xs">({item.time})</span>
            {idx < MACRO_FLASH_ITEMS.length - 1 && (
              <span className="text-slate-700 select-none ml-2">•</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
