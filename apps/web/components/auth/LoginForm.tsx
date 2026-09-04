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
        setErrorMessage(err.message || 'Invalid email or password credentials.');
      } else {
        setErrorMessage(
          typeof err.message === 'string'
            ? err.message
            : 'An error occurred during sign in. Please try again.'
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
          Sign in to your account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter your credentials to access editorial insights and community discussions.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Authentication Failed">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Input
            label="Email address"
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
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Forgot password? Contact administration.
            </span>
          </div>
          <Input
            label="Password"
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
          className="w-full justify-center h-10 font-bold tracking-wide"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="relative">
        <Divider />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setErrorMessage} />

      <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-2">
        Don&apos;t have an account?{' '}
        <Link
          href={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
          className="font-semibold text-primary hover:underline"
        >
          Join Community
        </Link>
      </div>
    </div>
  );
}
