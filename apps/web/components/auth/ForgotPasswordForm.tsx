'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/auth/auth-schemas';
import { authService } from '@/lib/auth/auth-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

export function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setSentEmail(data.email);
      setIsSent(true);
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(
        typeof err.message === 'string'
          ? err.message
          : 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !sentEmail) return;
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(sentEmail);
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi lại email vào lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl sm:text-[28px] font-bold leading-9 tracking-tight text-foreground">
          Quên mật khẩu?
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {isSent
            ? 'Chúng tôi đã gửi hướng dẫn khôi phục tài khoản đến hòm thư của bạn.'
            : 'Đừng lo lắng, hãy nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu.'}
        </p>
      </div>

      {errorMessage && (
        <Alert variant="danger" title="Không thể gửi email">
          {errorMessage}
        </Alert>
      )}

      {isSent ? (
        <div className="space-y-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Email đã được gửi đến:</p>
            <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {sentEmail}
            </p>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục Spam/Quảng cáo). Nhấp vào liên kết trong email để đặt lại mật khẩu mới.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={countdown > 0 || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleResend}
              className="w-full text-xs font-semibold"
            >
              {countdown > 0 ? `Gửi lại email sau (${countdown}s)` : 'Chưa nhận được? Gửi lại email'}
            </Button>
          </div>

          <div className="border-t border-emerald-200/50 pt-3 dark:border-emerald-900/40">
            <Link
              href="/dang-nhap"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="relative">
            <Input
              label="Địa chỉ email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
              id="forgot-email"
              autoComplete="email"
              aria-label="Địa chỉ email"
              aria-required="true"
              className="h-12 rounded-lg border-slate-300/70 bg-white/80 pl-11 dark:border-slate-700 dark:bg-slate-900"
            />
            <Mail
              className="pointer-events-none absolute left-4 top-[37px] h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full justify-center bg-gradient-to-r from-emerald-600 to-green-500 font-semibold shadow-sm text-white"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Gửi hướng dẫn khôi phục
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/dang-nhap"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại Đăng nhập</span>
            </Link>
          </div>
        </form>
      )}

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span>Hệ thống bảo mật bởi {BRAND.name}</span>
      </div>
    </div>
  );
}
