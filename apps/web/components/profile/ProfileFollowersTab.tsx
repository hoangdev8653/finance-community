'use client';

import React, { useState } from 'react';
import { useFollowers } from '@/lib/users/use-user-profile';
import { FollowUserCard } from './FollowUserCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react';

interface ProfileFollowersTabProps {
  userId: string;
  currentUserId?: string;
}

export function ProfileFollowersTab({ userId, currentUserId }: ProfileFollowersTabProps) {
  const [page, setPage] = useState(1);
  const { data: followersResponse, isLoading, isError, refetch } = useFollowers(userId, {
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
        title="Không thể tải danh sách người theo dõi"
        message="Không thể tải danh sách người đang theo dõi tài khoản này."
        onRetry={() => refetch()}
      />
    );
  }

  const followers = followersResponse?.data || [];

  if (followers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No followers yet"
        description="This analyst does not have any followers yet."
      />
    );
  }

  return (
    <div className="space-y-3 py-4">
      {followers.map((item) => (
        <FollowUserCard
          key={item.followerId}
          profile={item.profile}
          currentUserId={currentUserId}
        />
      ))}

      {followersResponse?.meta?.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            className="font-mono text-xs"
          >
            Load More Followers
          </Button>
        </div>
      )}
    </div>
  );
}
