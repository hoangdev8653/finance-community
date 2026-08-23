'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, ShieldCheck, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function MacroLeadStory() {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 transition-all"
      style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #111D4A 35%, #0A2E28 75%, #043828 100%)',
      }}
    >
      {/* Radial ambient glow */}
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] pointer-events-none rounded-full blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 space-y-5">
        {/* Top Editorial Metadata Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-heading font-bold text-emerald-300 backdrop-blur-xs">
              <Flame className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>{t('macro.leadBadge')}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>{t('macro.editorialDesk')}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span>{t('macro.justUpdated')} &bull; 08:30 GMT+7</span>
          </div>
        </div>

        {/* Lead Headline */}
        <div className="space-y-2.5">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            <Link
              href="/posts/community/fixed-income-multiples-monetary-policy-shift"
              className="hover:text-emerald-300 transition-colors"
            >
              {t('macro.macroHeadline')}
            </Link>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl font-normal">
            {t('macro.macroSummary')}
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5 space-y-3 backdrop-blur-md">
          <div className="text-xs font-heading font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>{t('macro.keyPoints')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-200">
            <div className="flex items-start gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('macro.point1')}</span>
            </div>

            <div className="flex items-start gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('macro.point2')}</span>
            </div>

            <div className="flex items-start gap-2 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('macro.point3')}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Rate Summary */}
        <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
          {/* CTA Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/posts/community/fixed-income-multiples-monetary-policy-shift"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm sm:text-base font-bold text-slate-950 transition-all duration-200 shadow-md shadow-emerald-950/40 hover:shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>{t('macro.readFullAnalysis')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/series"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/70 hover:bg-slate-700/80 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 backdrop-blur-xs cursor-pointer whitespace-nowrap"
            >
              {t('macro.viewMacroCharts')}
            </Link>
          </div>

          {/* Quick Metrics Tag */}
          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-mono font-semibold text-slate-200">
            <span>FED FUNDS: <strong className="text-emerald-400">4.75-5.00%</strong></span>
            <span className="text-slate-600">|</span>
            <span>DXY: <strong className="text-emerald-400">101.10 (-0.35%)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
