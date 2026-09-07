import type { Metadata } from 'next';
import LegacyPostDetailPage, { generateMetadata as generateLegacyMetadata } from '../../bai-viet/[contentType]/[slug]/page';

interface PageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateLegacyMetadata({ params: Promise.resolve({ contentType: 'community', slug }) });
}

export default async function CommunityPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return LegacyPostDetailPage({ params: Promise.resolve({ contentType: 'community', slug }) });
}
