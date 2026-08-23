'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #0D332D 80%, #064E3B 100%)',
      }}
    >
      {/* Ambient subtle glow lights */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 pointer-events-none rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 space-y-5">
        {/* Top Tagline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Finance Pulse Intelligence &bull; Verified Research</span>
        </div>

        {/* Main Title — Lexend font */}
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
          {t('home.heroTitle')}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
          {t('home.heroSubtitle')}
        </p>

        {/* Actions & Live Stats */}
        <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
          {/* Left CTA Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm sm:text-base font-bold text-slate-950 transition-all duration-200 shadow-md shadow-emerald-950/30 hover:shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              <span>{t('home.exploreResearch')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/60 hover:bg-slate-700/80 px-6 py-2.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 backdrop-blur-xs cursor-pointer whitespace-nowrap"
            >
              {t('home.joinCommunity')}
            </Link>
          </div>

          {/* Right Live Metrics Badge */}
          <div className="inline-flex items-center gap-3 sm:gap-4 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 backdrop-blur-md shadow-inner flex-wrap">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t('home.statsArticles')}</span>
            </div>
            <span className="text-slate-600 font-light">|</span>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span>{t('home.statsMembers')}</span>
            </div>
            <span className="text-slate-600 font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 font-semibold">{t('home.statsAccuracy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
