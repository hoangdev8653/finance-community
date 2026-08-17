'use client';

import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { FeatureFlagProvider } from '@/lib/feature-flags/FeatureFlagContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <FeatureFlagProvider>{children}</FeatureFlagProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
