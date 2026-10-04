'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicProfile } from '@/types/users';
import { useAuth } from '@/lib/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EditProfileModal } from './EditProfileModal';
import { ReportButton } from '@/components/moderation/ReportButton';
import { ReputationBadge } from '@/components/ui/ReputationBadge';
import {
  Calendar,
  Edit3,
  FileText,
  Share2,
  Check,
  Shield,
  Award,
  Sparkles,
  PenSquare,
  LayoutDashboard,
} from 'lucide-react';
import { useToast } from '@/lib/toast/ToastContext';

interface ProfileHeaderProps {
  profile: PublicProfile;
  analysesCount: number;
}

export function ProfileHeader({
  profile,
  analysesCount,
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSelf = Boolean(user && user.id === profile.userId);
  const isAdmin = Boolean(
    isSelf &&
      user &&
      user.roles &&
      user.roles.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))
  );
  const name = profile.displayName || profile.username;

  // Format joined date nicely in Vietnamese
  const joinedDate = (() => {
    try {
      const date = new Date(profile.createdAt);
      if (Number.isNaN(date.getTime())) return 'Gần đây';
      return new Intl.DateTimeFormat('vi-VN', {
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'Gần đây';
    }
  })();

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Đã sao chép liên kết hồ sơ vào khay nhớ tạm!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Không thể sao chép liên kết.');
    }
  };

  return (
    <>
      <header className="w-full overflow-hidden rounded-[10px] border border-border/80 bg-card text-card-foreground shadow-sm transition-all duration-200">
        {/* 1. Visual Cover Banner */}
        <div className="relative h-36 w-full sm:h-48 md:h-52 bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900">
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Ambient Glow */}
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* 2. Profile Details & Controls Container */}
        <div className="px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
          {/* Avatar and Top Actions Row */}
          <div className="-mt-14 mb-4 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar with Elevation Ring */}
            <div className="relative z-10 shrink-0">
              <Avatar
                src={profile.avatarUrl || undefined}
                fallback={name}
                alt={name}
                size="lg"
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-card bg-card text-2xl sm:text-3xl font-bold shadow-xl ring-2 ring-border/40"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pt-0">
              {isSelf ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="h-10 gap-2 rounded-[8px] border-border px-4 text-sm font-semibold transition-all hover:border-primary/50 hover:bg-muted/60"
                  >
                    <Edit3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </Button>

                  <Link href="/bai-viet/tao-moi">
                    <Button
                      size="sm"
                      className="h-10 gap-2 rounded-[8px] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      <PenSquare className="h-4 w-4" aria-hidden="true" />
                      <span>Viết bài mới</span>
                    </Button>
                  </Link>

                  <Link href="/bang-dieu-khien">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 gap-2 rounded-[8px] px-3 text-sm font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      title="Bàn làm việc tác giả"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden md:inline">Bàn làm việc</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="h-10 gap-2 rounded-[8px] border-border px-4 text-sm font-semibold transition-all hover:bg-muted/60"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
                  </Button>

                  <ReportButton
                    targetType="USER"
                    targetId={profile.userId}
                    targetTitle={`@${profile.username}`}
                    className="h-10 rounded-[8px] border border-border p-2.5 text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  />
                </>
              )}
            </div>
          </div>

          {/* User Names, Handle and Badges */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {name}
                </h1>

                {/* Role and Status Badges */}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Quản trị viên</span>
                  </span>
                )}

                <ReputationBadge score={profile.reputationScore} badge={profile.badge} />
              </div>

              <p className="font-mono text-sm font-medium text-muted-foreground">
                @{profile.username}
              </p>
            </div>

            {/* Biography */}
            {profile.bio ? (
              <p className="max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/85 sm:text-base">
                {profile.bio}
              </p>
            ) : isSelf ? (
              <p className="text-sm italic text-muted-foreground">
                Chưa có phần giới thiệu. Nhấn &ldquo;Chỉnh sửa hồ sơ&rdquo; để cập nhật giới thiệu và chuyên môn của bạn.
              </p>
            ) : null}
          </div>

          {/* Key Metrics & Meta Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5 text-sm">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Bài viết */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-base font-bold text-foreground">
                    {analysesCount}
                  </span>{' '}
                  <span className="text-xs font-medium text-muted-foreground">Bài viết đã đăng</span>
                </div>
              </div>

              {/* Điểm uy tín */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Award className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-mono text-base font-bold text-foreground">
                    {profile.reputationScore ?? 0}
                  </span>{' '}
                  <span className="text-xs font-medium text-muted-foreground">Điểm uy tín</span>
                </div>
              </div>

              {/* Thành viên từ */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-muted text-muted-foreground">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Thành viên từ</span>{' '}
                  <span className="text-xs font-semibold text-foreground capitalize">
                    {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang hoạt động</span>
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </>
  );
}
