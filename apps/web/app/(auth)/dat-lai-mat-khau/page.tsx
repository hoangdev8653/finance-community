import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Đặt Lại Mật Khẩu',
  description: 'Tạo mật khẩu mới an toàn cho tài khoản BrewSeven của bạn.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12">
          <LoadingState message="Đang chuẩn bị biểu mẫu đặt lại mật khẩu..." />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
