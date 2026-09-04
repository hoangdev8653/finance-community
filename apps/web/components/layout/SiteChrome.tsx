'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register' || pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/moderation';
  const hideChrome = isAuth || isAdmin;

  return <>
    {/* Skip Navigation Link — WCAG 2.1 Level A (2.4.1) */}
    {!hideChrome && (
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg"
      >
        Chuyển đến nội dung chính
      </a>
    )}
    {!hideChrome && <Header />}
    <div className="flex-1 flex flex-col">{children}</div>
    {!hideChrome && <Footer />}
    {!hideChrome && <MobileNavigation />}
  </>;
}

