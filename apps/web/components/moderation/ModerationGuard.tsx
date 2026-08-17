'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModerationGuardProps {
  children: React.ReactNode;
}

export function ModerationGuard({ children }: ModerationGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-mono text-muted-foreground">
          Authenticating moderator credentials...
        </p>
      </div>
    );
  }

  const isModerator = Boolean(
    isAuthenticated &&
      user &&
      user.roles &&
      user.roles.some((role) =>
        ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)
      )
  );

  if (!isModerator) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Access Restricted
          </h1>
          <p className="text-xs text-muted-foreground">
            The moderation console requires elevated moderator or governance privileges.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Platform</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
