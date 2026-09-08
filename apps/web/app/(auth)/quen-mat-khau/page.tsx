import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu',
  description: 'Khôi phục quyền truy cập vào tài khoản BrewSeven của bạn.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState message="Đang tải biểu mẫu khôi phục..." />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
