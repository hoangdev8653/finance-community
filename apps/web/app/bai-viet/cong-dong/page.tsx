import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { CommunityPostsView } from '@/components/posts/CommunityPostsView';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bài viết cộng đồng',
  description: 'Góc nhìn, kinh nghiệm và thảo luận tài chính từ cộng đồng BrewSeven.',
  canonicalPath: '/bai-viet/cong-dong',
});

export default function CommunityPostsPage() {
  return <CommunityPostsView />;
}
