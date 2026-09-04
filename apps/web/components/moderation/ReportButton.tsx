'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ReportTargetType } from '@/types/moderation';
import { ReportModal } from './ReportModal';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  className?: string;
  variant?: 'icon' | 'text';
}

export function ReportButton({
  targetType,
  targetId,
  targetTitle,
  className = '',
  variant = 'icon',
}: ReportButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setIsModalOpen(true);
  };

  const targetLabel =
    targetType === 'POST' ? 'Post' : targetType === 'COMMENT' ? 'Comment' : 'User';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isAuthenticated ? `Báo cáo ${targetLabel}` : `Đăng nhập để báo cáo ${targetLabel}`}
        className={`inline-flex items-center gap-1 text-muted-foreground hover:text-danger transition-colors rounded p-1 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary ${className}`}
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
        {variant === 'text' && <span className="text-xs font-mono">Báo cáo</span>}
      </button>

      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetType={targetType}
          targetId={targetId}
          targetTitle={targetTitle}
        />
      )}
    </>
  );
}
