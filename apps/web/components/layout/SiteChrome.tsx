'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/moderation';

  return <>
    <Header />
    <div className="flex-1">{children}</div>
    {!isAdmin && <Footer />}
    {!isAdmin && <MobileNavigation />}
  </>;
}
