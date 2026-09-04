import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoadingState } from '@/components/feedback/LoadingState';

export const metadata: Metadata = {
  title: 'Đăng Ký Thành Viên Cộng Đồng',
  description: 'Tạo tài khoản MorningView để xuất bản bài phân tích thị trường và kết nối cùng mạng lưới nhà đầu tư.',
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
