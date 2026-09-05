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
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = sanitizeRedirectUrl(redirectParam, '/');

  const { login, loginWithFacebook } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

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
          Đăng nhập
        </h1>
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href={`/register${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} className="font-medium text-primary hover:underline">
            Đăng ký ngay
          </Link>
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
            <span className="text-xs font-medium text-primary">
              Quên mật khẩu?
            </span>
          </div>
            <div className="relative">
              <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            id="login-password"
            autoComplete="current-password"
              aria-required="true"
              className="pr-11"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'} className="absolute right-3 top-8 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
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
      <Button type="button" variant="outline" disabled={isFacebookLoading} isLoading={isFacebookLoading} onClick={async () => { setIsFacebookLoading(true); try { if (!loginWithFacebook) throw new Error('Đăng nhập Facebook chưa được cấu hình.'); await loginWithFacebook('mock_facebook_token_facebook_user'); handleGoogleSuccess(); } catch (err: any) { setErrorMessage(err.message || 'Đăng nhập Facebook thất bại.'); } finally { setIsFacebookLoading(false); } }} className="w-full justify-center gap-3 font-semibold">
        <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.09 4.39 23.08 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z" /></svg>
        Tiếp tục với Facebook
      </Button>
      <div className="flex items-center justify-center gap-2 pt-1 text-sm text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
        <span>Thông tin của bạn được bảo mật tuyệt đối<br />bởi Finance Community.</span>
      </div>
    </div>
  );
}
