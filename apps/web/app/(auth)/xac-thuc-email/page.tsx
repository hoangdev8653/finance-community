import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailView } from '@/components/auth/VerifyEmailView';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Xác Thực Email',
  description: 'Kích hoạt tài khoản BrewSeven của bạn để tham gia thảo luận và học tập.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState message="Đang kết nối hệ thống xác thực..." />
        </div>
      }
    >
      <VerifyEmailView />
    </Suspense>
  );
}
