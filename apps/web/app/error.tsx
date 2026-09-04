'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="font-heading text-xl font-bold text-foreground mb-2">
        Đã xảy ra lỗi
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Hệ thống gặp sự cố khi tải nội dung. Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="primary" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
