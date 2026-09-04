'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ErrorState } from '@/components/feedback/ErrorState';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      fallback || (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <ErrorState
            title="Yêu cầu đăng nhập"
            message="Vui lòng đăng nhập để truy cập khu vực này."
          />
        </div>
      )
    );
  }

  const hasRole = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return (
      fallback || (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <ErrorState
            title="Khu vực bị giới hạn"
            message="Tài khoản của bạn không có quyền xem khu vực này."
          />
        </div>
      )
    );
  }

  return <>{children}</>;
}
