'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Đang xác minh quyền quản trị..." className="min-h-[50vh]" />;
  }

  const isAdmin = Boolean(
    isAuthenticated &&
      user &&
      user.roles &&
      user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))
  );

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Yêu cầu quyền quản trị
          </h1>
          <p className="text-xs text-muted-foreground">
            Khu vực quản trị chỉ dành cho tài khoản có quyền quản trị nâng cao.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại nền tảng</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
