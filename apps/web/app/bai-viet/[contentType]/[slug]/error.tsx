'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PostDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Post Detail Error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-2">
          Không thể tải bài viết
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Bài viết có thể đã bị xóa, ẩn hoặc hệ thống gặp sự cố tạm thời. Vui lòng thử lại.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={reset} variant="primary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/posts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
