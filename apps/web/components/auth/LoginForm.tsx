'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '@/lib/auth/auth-schemas';
import { useAuth } from '@/lib/auth/AuthContext';
import { sanitizeRedirectUrl } from '@/lib/auth/redirect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Divider } from '@/components/ui/Divider';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = sanitizeRedirectUrl(redirectParam, '/');

  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(data);
      router.push(targetRedirect);
    } catch (err: any) {
      if (err.code === 'SOCIAL_ACCOUNT_NO_PASSWORD') {
        setErrorMessage(
          err.message ||
            'Tài khoản này được liên kết qua Google. Vui lòng bấm nút "Tiếp tục sử dụng dịch vụ bằng Google" bên dưới để đăng nhập.'
        );
      } else if (err.statusCode === 401 || err.code === 'INVALID_CREDENTIALS') {
        setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
      } else {
        setErrorMessage(
          typeof err.message === 'string'
            ? err.message
            : 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push(targetRedirect);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Đăng nhập vào tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Đăng nhập để truy cập các bài phân tích và tham gia thảo luận cộng đồng.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Đăng nhập thất bại">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Input
            label="Địa chỉ email"
            type="email"
            placeholder="analyst@finance.com"
            error={errors.email?.message}
            {...register('email')}
            id="login-email"
            autoComplete="email"
            aria-required="true"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              Quên mật khẩu? Vui lòng liên hệ quản trị viên.
            </span>
          </div>
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            id="login-password"
            autoComplete="current-password"
            aria-required="true"
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center h-10 font-semibold"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Đăng nhập
        </Button>
      </form>

      <div className="relative">
        <Divider />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-surface px-2 text-xs uppercase text-muted-foreground font-mono">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setErrorMessage} />

      <div className="text-center text-sm text-muted-foreground pt-2">
        Chưa có tài khoản?{' '}
        <Link
          href={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
          className="font-medium text-primary hover:underline"
        >
          Đăng ký tham gia
        </Link>
      </div>
    </div>
  );
}
