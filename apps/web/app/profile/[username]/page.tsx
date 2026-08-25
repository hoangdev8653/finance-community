import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { usersService } from '@/lib/users/users-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateProfileJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { AppShell } from '@/components/layout/AppShell';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  try {
    const profile = await usersService.getPublicProfile(username);
    const title = `${profile.displayName || profile.username} (@${profile.username}) | Hồ Sơ Nhà Phân Tích`;
    const description =
      profile.bio ||
      'Hồ sơ nhà phân tích và cộng tác viên nghiên cứu tài chính trên nền tảng Finance Pulse.';
    const canonicalPath = `/profile/${encodeURIComponent(username)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'profile',
      twitterCard: 'summary',
    });
  } catch {
    return buildPageMetadata({
      title: 'Không Tìm Thấy Hồ Sơ Nhà Phân Tích',
      noIndex: true,
    });
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  let profile;
  try {
    profile = await usersService.getPublicProfile(username);
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  // Schema.org ProfilePage / Person & Breadcrumbs JSON-LD
  const profileJsonLd = generateProfileJsonLd(profile);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    {
      name: `@${profile.username}`,
      url: `/profile/${encodeURIComponent(username)}`,
    },
  ]);


  return (
    <AppShell>
      <JsonLd data={[profileJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileView initialProfile={profile} />
      </Suspense>
    </AppShell>
  );
}
