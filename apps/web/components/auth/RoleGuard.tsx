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
            title="Authentication Required"
            message="Please sign in to access this restricted section."
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
            title="Access Restricted"
            message="You do not have permission to view this section."
          />
        </div>
      )
    );
  }

  return <>{children}</>;
}
