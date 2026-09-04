import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Đăng Nhập Tài Khoản',
  description: 'Đăng nhập tài khoản MorningView để truy cập các bài nghiên cứu chuyên sâu và thảo luận cùng cộng đồng.',
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
          <LoadingState message="Đang tải biểu mẫu đăng nhập..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
