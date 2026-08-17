import React from 'react';
import Link from 'next/link';
import { FollowItemProfile } from '@/types/users';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from './FollowButton';

interface FollowUserCardProps {
  profile: FollowItemProfile | null;
  currentUserId?: string;
}

export function FollowUserCard({ profile, currentUserId }: FollowUserCardProps) {
  if (!profile) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface text-xs text-muted-foreground italic">
        User account no longer active
      </div>
    );
  }

  const name = profile.displayName || profile.username;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface shadow-2xs gap-4">
      <Link
        href={`/profile/${encodeURIComponent(profile.username)}`}
        className="flex items-center gap-3 min-w-0 group"
      >
        <Avatar fallback={name} alt={name} size="md" className="shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {name}
          </p>
          <p className="text-xs text-muted-foreground font-mono truncate">
            @{profile.username}
          </p>
        </div>
      </Link>

      {currentUserId !== profile.userId && (
        <FollowButton
          targetUserId={profile.userId}
          targetUsername={profile.username}
        />
      )}
    </div>
  );
}
