'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/auth/auth-schemas';
import { authService } from '@/lib/auth/auth-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LockKeyhole, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('password', '');
  const hasMinLength = currentPassword.length >= 6;
  const hasNumber = /\d/.test(currentPassword);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage('Mã token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        typeof err.message === 'string'
          ? err.message
          : 'Không thể đặt lại mật khẩu. Vui lòng thử yêu cầu lại liên kết mới.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Liên kết không hợp lệ
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Liên kết đặt lại mật khẩu của bạn bị thiếu mã xác thực hoặc đã hết hạn sau 15 phút bảo mật.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="w-full justify-center bg-primary font-semibold text-primary-foreground">
            <Link href="/quen-mat-khau">
              Yêu cầu gửi lại liên kết mới
            </Link>
          </Button>
        </div>
        <div>
          <Link href="/dang-nhap" className="text-xs font-semibold text-primary hover:underline">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
            Đổi mật khẩu thành công!
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Mật khẩu mới của bạn đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập vào tài khoản của mình.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="h-11 w-full justify-center bg-gradient-to-r from-emerald-600 to-green-500 font-semibold text-white shadow-sm">
            <Link href="/dang-nhap" className="inline-flex items-center gap-2">
              <span>Đăng nhập ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl sm:text-[28px] font-bold leading-9 tracking-tight text-foreground">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {email ? (
            <>
              Thiết lập mật khẩu mới cho tài khoản <span className="font-semibold text-foreground">{email}</span>.
            </>
          ) : (
            'Hãy nhập mật khẩu mới bảo mật cho tài khoản của bạn.'
          )}
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Lỗi đặt lại mật khẩu">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <Input
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tối thiểu 6 ký tự"
            error={errors.password?.message}
            {...register('password')}
            id="reset-password"
            autoComplete="new-password"
            aria-required="true"
            className="h-12 rounded-lg border-slate-300/70 bg-white/80 pl-11 pr-11 dark:border-slate-700 dark:bg-slate-900"
          />
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-[37px] h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            className="absolute right-3 top-8 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu mới"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            id="reset-confirm-password"
            autoComplete="new-password"
            aria-required="true"
            className="h-12 rounded-lg border-slate-300/70 bg-white/80 pl-11 pr-11 dark:border-slate-700 dark:bg-slate-900"
          />
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-[37px] h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            className="absolute right-3 top-8 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Password hints */}
        <div className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-xs text-muted-foreground dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>Ít nhất 6 ký tự</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>Nên chứa chữ số và ký tự đặc biệt</span>
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full justify-center bg-gradient-to-r from-emerald-600 to-green-500 font-semibold text-white shadow-sm"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Xác nhận đặt lại mật khẩu
        </Button>
      </form>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span>Mật khẩu được mã hóa an toàn với chuẩn bcrypt</span>
      </div>
    </div>
  );
}
