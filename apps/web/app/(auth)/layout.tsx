import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Background Glow Effects */}
      <div
        className="pointer-events-none fixed -top-32 left-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl dark:bg-primary/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-32 right-1/4 -z-10 h-96 w-96 rounded-full bg-accent/8 blur-3xl dark:bg-accent/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 -left-24 -z-10 h-64 w-64 rounded-full bg-info/6 blur-3xl dark:bg-info/4"
        aria-hidden="true"
      />

      {/* Top Bar with Brand & Back to Home Button */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="MorningView"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
            Morning<span className="text-teal-600 dark:text-teal-400">View</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border bg-surface px-3.5 py-2 shadow-xs hover:bg-surface-elevated"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về Trang chủ</span>
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="my-auto flex flex-col items-center justify-center py-8">
        {/* Trust Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm shadow-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Nền tảng tri thức tài chính uy tín</span>
        </div>

        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-sm">
          {children}
        </div>

        {/* Feature highlights below the form */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Phân tích chuyên sâu
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            Kiểm duyệt nghiêm ngặt
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span>Cộng đồng 5.4K+ thành viên</span>
        </div>
      </main>

      {/* Bottom Minimal Copyright */}
      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MorningView Platform. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
}
