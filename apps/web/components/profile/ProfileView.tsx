'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicProfile } from '@/types/users';
import { usePublicProfile, useFollowers, useFollowing } from '@/lib/users/use-user-profile';
import { postsService } from '@/lib/posts/posts-service';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs, ProfileTabType } from './ProfileTabs';
import { ProfilePostsTab } from './ProfilePostsTab';
import { ProfileFollowersTab } from './ProfileFollowersTab';
import { ProfileFollowingTab } from './ProfileFollowingTab';

interface ProfileViewProps {
  initialProfile: PublicProfile;
}

export function ProfileView({ initialProfile }: ProfileViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('analyses');

  const { data: profile = initialProfile } = usePublicProfile(
    initialProfile.username,
    initialProfile
  );

  // Fetch counts
  const { data: followersData } = useFollowers(profile.userId, { limit: 1 });
  const { data: followingData } = useFollowing(profile.userId, { limit: 1 });
  const { data: postsData } = useQuery({
    queryKey: ['posts', 'list', { authorId: profile.userId, status: 'PUBLISHED', limit: 1 }],
    queryFn: () =>
      postsService.getFeed({
        authorId: profile.userId,
        status: 'PUBLISHED',
        limit: 1,
      }),
    staleTime: 60 * 1000,
  });

  const followersCount = followersData?.meta?.totalItems ?? 0;
  const followingCount = followingData?.meta?.totalItems ?? 0;
  const analysesCount = postsData?.meta?.totalItems ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        followersCount={followersCount}
        followingCount={followingCount}
        analysesCount={analysesCount}
      />

      {/* Tabs & Content Panels */}
      <div className="space-y-6">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          analysesCount={analysesCount}
          followersCount={followersCount}
          followingCount={followingCount}
        />

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'analyses' && <ProfilePostsTab userId={profile.userId} />}
          {activeTab === 'followers' && (
            <ProfileFollowersTab userId={profile.userId} currentUserId={user?.id} />
          )}
          {activeTab === 'following' && (
            <ProfileFollowingTab userId={profile.userId} currentUserId={user?.id} />
          )}
        </div>
      </div>
    </main>
  );
}
