import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-100 dark:bg-[#0b0f17] py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Brand & Back to Home Button */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="MorningView"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
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
      <main className="my-auto flex items-center justify-center py-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
          {children}
        </div>
      </main>

      {/* Bottom Minimal Copyright */}
      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MorningView Platform. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
}

