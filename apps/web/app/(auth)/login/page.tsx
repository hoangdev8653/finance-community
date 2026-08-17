import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Finance Pulse account to access editorial research and discussions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState message="Loading sign-in form..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
