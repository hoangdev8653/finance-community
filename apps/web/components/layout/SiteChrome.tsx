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
    {!hideChrome && <Header />}
    <div className="flex-1 flex flex-col">{children}</div>
    {!hideChrome && <Footer />}
    {!hideChrome && <MobileNavigation />}
  </>;
}

