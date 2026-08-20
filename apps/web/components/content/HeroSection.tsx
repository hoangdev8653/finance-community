'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg"
      style={{
        background: 'linear-gradient(125deg, #092055 0%, #0d2f78 30%, #1348a4 65%, #1b60d4 100%)',
      }}
    >
      {/* Soft atmospheric radial glow at the top-right corner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 85% 20%, rgba(59, 130, 246, 0.35) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 space-y-4">
        {/* Title — Elegant editorial serif typography */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
          Financial Intelligence &amp; Knowledge Hub
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
          In-depth financial knowledge, wealth planning frameworks, and curated editorial insights from leading industry practitioners.
        </p>

        {/* Action Controls & Stats Row */}
        <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
          {/* Left: Action CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/posts"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2 text-sm sm:text-base font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Explore Research
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/10 px-6 py-2 text-sm sm:text-base font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              Join Community
            </Link>
          </div>

          {/* Right: Unified Stats Badge with dividers */}
          <div
            className="inline-flex items-center gap-3 rounded-xl border border-white/25 px-4 py-2 text-xs sm:text-sm font-medium text-white/95 shadow-inner"
            style={{
              backgroundColor: 'rgba(8, 26, 70, 0.75)',
            }}
          >
            <span>1.2K+ Articles</span>
            <span className="text-white/40 font-light">|</span>
            <span>500+ Members</span>
            <span className="text-white/40 font-light">|</span>
            <span>50+ Series</span>
          </div>
        </div>
      </div>
    </div>
  );
}
