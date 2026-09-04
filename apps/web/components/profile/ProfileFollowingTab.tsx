'use client';

import React, { useState } from 'react';
import { useFollowing } from '@/lib/users/use-user-profile';
import { FollowUserCard } from './FollowUserCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react';

interface ProfileFollowingTabProps {
  userId: string;
  currentUserId?: string;
}

export function ProfileFollowingTab({ userId, currentUserId }: ProfileFollowingTabProps) {
  const [page, setPage] = useState(1);
  const { data: followingResponse, isLoading, isError, refetch } = useFollowing(userId, {
    page,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface animate-pulse">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Không thể tải danh sách đang theo dõi"
        message="Không thể tải danh sách người dùng đang theo dõi."
        onRetry={() => refetch()}
      />
    );
  }

  const following = followingResponse?.data || [];

  if (following.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Not following anyone yet"
        description="This analyst is not following any other analysts yet."
      />
    );
  }

  return (
    <div className="space-y-3 py-4">
      {following.map((item) => (
        <FollowUserCard
          key={item.followingId}
          profile={item.profile}
          currentUserId={currentUserId}
        />
      ))}

      {followingResponse?.meta?.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            className="font-mono text-xs"
          >
            Load More Following
          </Button>
        </div>
      )}
    </div>
  );
}
