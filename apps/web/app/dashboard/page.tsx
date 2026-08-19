import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Analyst Dashboard',
  description: 'Manage your financial publications, track reader engagement, and draft in-depth valuation models.',
  noIndex: true,
  noFollow: true,
});

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardView />
      </AppShell>
    </AuthGuard>
  );
}
