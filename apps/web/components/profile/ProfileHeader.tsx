'use client';

import React, { useState } from 'react';
import { PublicProfile } from '@/types/users';
import { useAuth } from '@/lib/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FollowButton } from './FollowButton';
import { EditProfileModal } from './EditProfileModal';
import { ReportButton } from '@/components/moderation/ReportButton';
import { ReputationBadge } from '@/components/ui/ReputationBadge';
import { Calendar, Users, Edit3 } from 'lucide-react';

interface ProfileHeaderProps {
  profile: PublicProfile;
  followersCount: number;
  followingCount: number;
  analysesCount: number;
  onFollowChange?: (following: boolean) => void;
}

export function ProfileHeader({
  profile,
  followersCount,
  followingCount,
  analysesCount,
  onFollowChange,
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSelf = Boolean(user && user.id === profile.userId);
  const name = profile.displayName || profile.username;
  const shortId = profile.userId.slice(0, 8);

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <header className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Top Bar: Avatar, Names, and CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar fallback={name} alt={name} size="lg" className="h-18 w-18 text-xl ring-2 ring-slate-300 dark:ring-slate-700 rounded-full shrink-0" />
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight truncate">
                {name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap pt-0.5 text-sm text-slate-600 dark:text-slate-400 font-mono">
                <span className="font-bold text-slate-800 dark:text-slate-200">@{profile.username}</span>
                <span>•</span>
                <span className="text-xs font-mono font-bold py-0.5 px-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  Chuyên gia #{shortId}
                </span>
                <ReputationBadge score={profile.reputationScore} badge={profile.badge} />
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="font-bold text-sm rounded-xl px-4 py-2 gap-1.5 border-slate-300 dark:border-slate-700 shadow-2xs"
              >
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>Chỉnh sửa hồ sơ</span>
              </Button>
            ) : (
              <>
                <FollowButton
                  targetUserId={profile.userId}
                  targetUsername={profile.username}
                  onFollowChange={onFollowChange}
                />
                <ReportButton
                  targetType="USER"
                  targetId={profile.userId}
                  targetTitle={`@${profile.username}`}
                  className="p-2 border border-slate-300 dark:border-slate-700 hover:border-danger/40 rounded-xl"
                />
              </>
            )}
          </div>
        </div>

        {/* Executive Bio */}
        {profile.bio && (
          <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}

        {/* Bottom Bar: Stats and Joined Date */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-6">
            <div>
              <strong className="text-slate-950 dark:text-slate-100 font-bold text-base">{analysesCount}</strong>{' '}
              <span>Bài viết</span>
            </div>
            <div>
              <strong className="text-slate-950 dark:text-slate-100 font-bold text-base">{followersCount}</strong>{' '}
              <span>Người theo dõi</span>
            </div>
            <div>
              <strong className="text-slate-950 dark:text-slate-100 font-bold text-base">{followingCount}</strong>{' '}
              <span>Đang theo dõi</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Thành viên từ {joinedDate}</span>
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
