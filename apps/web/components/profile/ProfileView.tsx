'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicProfile } from '@/types/users';
import { usePublicProfile } from '@/lib/users/use-user-profile';
import { postsService } from '@/lib/posts/posts-service';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs, ProfileTabType } from './ProfileTabs';
import { ProfilePostsTab } from './ProfilePostsTab';

interface ProfileViewProps {
  initialProfile: PublicProfile;
}

export function ProfileView({ initialProfile }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabType>('analyses');

  const { data: profile = initialProfile } = usePublicProfile(
    initialProfile.username,
    initialProfile
  );

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

  const analysesCount = postsData?.meta?.totalItems ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        analysesCount={analysesCount}
      />

      {/* Tabs & Content Panels */}
      <div className="space-y-6">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          analysesCount={analysesCount}
        />

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'analyses' && <ProfilePostsTab userId={profile.userId} />}
        </div>
      </div>
    </main>
  );
}
