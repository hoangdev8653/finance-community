'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useFollowUser, useUnfollowUser } from '@/lib/users/use-user-profile';
import { Button } from '@/components/ui/Button';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  isFollowingInitial?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  targetUserId,
  targetUsername,
  isFollowingInitial = false,
  onFollowChange,
}: FollowButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [isHovered, setIsHovered] = useState(false);

  const followMutation = useFollowUser(targetUserId, user?.id);
  const unfollowMutation = useUnfollowUser(targetUserId, user?.id);

  // Never show follow button for own profile
  if (user && user.id === targetUserId) {
    return null;
  }

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || `/profile/${targetUsername}`)}`);
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync();
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await followMutation.mutateAsync();
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch {
      // Error handled by mutation toast/state
    }
  };

  if (isFollowing) {
    return (
      <Button
        variant={isHovered ? 'destructive' : 'outline'}
        size="sm"
        onClick={handleClick}
        isLoading={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="font-mono text-xs gap-1.5 min-w-[100px]"
      >
        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{isHovered ? 'Unfollow' : 'Following'}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleClick}
      isLoading={isLoading}
      className="font-mono text-xs gap-1.5 min-w-[100px]"
    >
      <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Follow</span>
    </Button>
  );
}
