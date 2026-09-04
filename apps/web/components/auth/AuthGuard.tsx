'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Alert } from '@/components/ui/Alert';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
      router.push(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingState message="Đang xác minh phiên đăng nhập..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Awaiting router redirect
  }

  if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Alert
          variant="danger"
          title={`Account ${user.status === 'BANNED' ? 'Banned' : 'Suspended'}`}
        >
          Your account is currently {user.status.toLowerCase()}. Access to authenticated platform
          tính năng đã bị giới hạn. Vui lòng liên hệ quản trị viên nếu bạn cho rằng
          this is an error.
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
