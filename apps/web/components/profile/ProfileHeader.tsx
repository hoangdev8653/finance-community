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

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <header className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xs">
        {/* Top Bar: Avatar, Names, and CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar fallback={name} alt={name} size="lg" className="h-16 w-16 text-lg shrink-0" />
            <div className="min-w-0">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">
                {name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs text-muted-foreground font-mono">
                <span>@{profile.username}</span>
                <span>•</span>
                <Badge variant="outline" className="text-2xs font-mono py-0 px-1.5">
                  Analyst #{shortId}
                </Badge>
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
                className="font-mono text-xs gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Edit Profile</span>
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
                  className="p-2 border border-border hover:border-danger/40 rounded-md"
                />
              </>
            )}
          </div>
        </div>

        {/* Executive Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}

        {/* Bottom Bar: Stats and Joined Date */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-6">
            <div>
              <strong className="text-foreground font-semibold">{analysesCount}</strong>{' '}
              <span>Analyses</span>
            </div>
            <div>
              <strong className="text-foreground font-semibold">{followersCount}</strong>{' '}
              <span>Followers</span>
            </div>
            <div>
              <strong className="text-foreground font-semibold">{followingCount}</strong>{' '}
              <span>Following</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Member since {joinedDate}</span>
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
