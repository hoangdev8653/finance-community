'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth/auth-service';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Loader2, ArrowRight, MailCheck, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Mã xác thực không tìm thấy hoặc đường dẫn kích hoạt không đầy đủ.');
      return;
    }

    let isMounted = true;
    authService
      .verifyEmail(token)
      .then((res) => {
        if (isMounted) {
          setIsSuccess(res.success !== false);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsSuccess(false);
          setIsLoading(false);
          setErrorMessage(err.message || 'Mã xác thực đã hết hạn hoặc không hợp lệ.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Đang xác thực địa chỉ email
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Hệ thống đang kiểm tra mã token kích hoạt tài khoản của bạn, vui lòng đợi trong giây lát...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <MailCheck className="h-3.5 w-3.5" />
            <span>Tài khoản đã được kích hoạt</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
            Xác thực email thành công!
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {email ? (
              <>
                Hòm thư <span className="font-semibold text-foreground">{email}</span> đã được xác minh thành công. Bạn đã mở khóa toàn bộ quyền thảo luận, bình luận và học tập trên {BRAND.name}.
              </>
            ) : (
              `Chào mừng bạn đến với cộng đồng học tập tài chính ${BRAND.name}. Mọi quyền hạn tương tác của bạn đã sẵn sàng.`
            )}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button asChild className="h-11 w-full justify-center bg-gradient-to-r from-emerald-600 to-green-500 font-semibold text-white shadow-sm">
            <Link href="/dang-nhap" className="inline-flex items-center gap-2">
              <span>Đăng nhập vào tài khoản</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 w-full justify-center">
            <Link href="/">
              Khám phá trang chủ
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>Bảo vệ quyền lợi thành viên {BRAND.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <XCircle className="h-9 w-9" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Xác thực không thành công
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {errorMessage || 'Liên kết xác thực email của bạn không hợp lệ hoặc đã hết hạn.'}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Button asChild className="w-full justify-center bg-primary font-semibold text-primary-foreground">
          <Link href="/dang-nhap">
            Đến trang Đăng nhập
          </Link>
        </Button>
        <div>
          <Link href="/lien-he" className="text-xs font-semibold text-primary hover:underline">
            Cần trợ giúp? Liên hệ Tòa soạn
          </Link>
        </div>
      </div>
    </div>
  );
}
