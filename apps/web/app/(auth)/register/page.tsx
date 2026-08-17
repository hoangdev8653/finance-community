import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Join Community',
  description: 'Create a Finance Pulse account to publish market analyses and engage with peers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState message="Loading registration form..." />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
