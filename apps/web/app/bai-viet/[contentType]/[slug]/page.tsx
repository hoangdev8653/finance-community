import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { postsService } from '@/lib/posts/posts-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateArticleJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostDetailView } from '@/components/content/PostDetailView';
import { PostDetailSkeleton } from '@/components/content/PostDetailSkeleton';
import type { PostDetailResponse } from '@/types/content';

interface PageProps {
  params: Promise<{
    contentType: string;
    slug: string;
  }>;
}

const demoArticle: PostDetailResponse = {
  id: 'demo-community-article',
  authorId: 'brewseven-editorial',
  author: { displayName: 'Ban Biên Tập BrewSeven' },
  contentType: 'COMMUNITY',
  title: 'Xây dựng quỹ khẩn cấp: nền móng bình tĩnh cho mọi kế hoạch tài chính',
  slug: 'demo',
  body: `<p>Quỹ khẩn cấp là khoản tiền được chuẩn bị riêng cho những biến cố không dự đoán trước. Đây không phải là khoản đầu tư để tạo lợi nhuận, mà là lớp đệm giúp bạn giữ nhịp sống và không phải đưa ra quyết định vội vàng khi thu nhập bị gián đoạn.</p><h2>Vì sao nên bắt đầu từ quỹ khẩn cấp?</h2><p>Khi có một khoản dự phòng phù hợp, bạn có thêm thời gian để đánh giá lựa chọn thay vì vay nóng hoặc bán tài sản vào thời điểm bất lợi. Với người mới bắt đầu, mục tiêu dễ thực hiện nhất là tích lũy chi phí thiết yếu cho ba đến sáu tháng.</p><h2>Xác định con số phù hợp với bạn</h2><p>Hãy liệt kê các khoản chi không thể trì hoãn như nhà ở, ăn uống, y tế, đi lại và nghĩa vụ trả nợ. Nhân tổng số đó với số tháng bạn cần được bảo vệ. Con số này là mục tiêu; bạn có thể chia thành những cột mốc nhỏ hơn để tiến từng bước.</p><blockquote><p>Điều quan trọng không phải là tích lũy thật nhanh, mà là duy trì thói quen dành một phần thu nhập cho sự an tâm của chính mình.</p></blockquote><h2>Ba bước để bắt đầu ngay hôm nay</h2><ol><li>Tách một tài khoản dành riêng cho quỹ dự phòng.</li><li>Thiết lập khoản chuyển tự động ngay sau ngày nhận lương.</li><li>Chỉ dùng quỹ cho tình huống thực sự khẩn cấp và bổ sung lại sau đó.</li></ol><p>Khi nền móng tài chính đã vững hơn, bạn sẽ tự tin xây dựng các mục tiêu tiếp theo như đầu tư, học tập và trải nghiệm.</p>`,
  coverMediaId: 'demo-cover',
  categoryId: null,
  status: 'PUBLISHED',
  metaTitle: null,
  metaDescription: 'Bài viết demo để xem trước giao diện đọc bài BrewSeven.',
  viewCount: 128,
  publishedAt: '2026-09-07T09:00:00.000Z',
  createdAt: '2026-09-07T09:00:00.000Z',
  updatedAt: '2026-09-07T09:00:00.000Z',
  deletedAt: null,
  tags: [
    { id: 'personal-finance', name: 'Tài chính cá nhân', slug: 'tai-chinh-ca-nhan' },
    { id: 'financial-habits', name: 'Thói quen tài chính', slug: 'thoi-quen-tai-chinh' },
  ],
  media: [{ id: 'demo-cover', purpose: 'cover', sortOrder: 0, secureUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=85' }],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { contentType, slug } = await params;
  const normalizedType = contentType.toLowerCase();
  const isCommunity = normalizedType === 'cong-dong';

  if (!isCommunity && normalizedType !== 'series') {
    return buildPageMetadata({
      title: 'Không Tìm Thấy Bài Viết',
      noIndex: true,
    });
  }

  try {
    const apiContentType = isCommunity ? 'COMMUNITY' : 'SERIES';
    const post = await postsService.getBySlug(apiContentType, slug);
    const coverMedia = post.coverMediaId
      ? post.media.find((m) => m.id === post.coverMediaId)
      : post.media[0];

    const title = post.metaTitle || post.title;
    const description =
      post.metaDescription ||
      'Phân tích tài chính chuyên sâu, mô hình định giá và thông tin thị trường trên BrewSeven.';
    const canonicalPath = isCommunity
      ? `/bai-viet/cong-dong/${encodeURIComponent(slug)}`
      : `/bai-viet/series/${encodeURIComponent(slug)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'article',
      ogImage: coverMedia?.secureUrl,
      twitterCard: 'summary_large_image',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags?.map((t) => t.name),
    });
  } catch {
    return buildPageMetadata({
      title: 'Không Tìm Thấy Bài Viết',
      noIndex: true,
    });
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { contentType, slug } = await params;
  const normalizedType = contentType.toLowerCase();
  const isCommunity = normalizedType === 'cong-dong';

  if (!isCommunity && normalizedType !== 'series') {
    notFound();
  }

  let post: PostDetailResponse;
  if (isCommunity && slug === 'demo') {
    post = demoArticle;
  } else {
    try {
      const apiContentType = isCommunity ? 'COMMUNITY' : 'SERIES';
      post = await postsService.getBySlug(apiContentType, slug);
    } catch {
      notFound();
    }
  }

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  const domains = await postsService.getDomains().catch(() => []);
  const domain = post.domainId ? domains.find((item) => item.id === post.domainId) : undefined;
  if (domain) {
    permanentRedirect(`/${encodeURIComponent(domain.slug)}/bai-viet/${encodeURIComponent(post.slug)}`);
  }

  // Generate safe Schema.org Article & Breadcrumbs JSON-LD
  const articleJsonLd = generateArticleJsonLd(post);
  const sectionLabel = post.contentType === 'SERIES' ? 'Series' : 'Bài Viết Cộng Đồng';
  const sectionUrl = post.contentType === 'SERIES' ? '/series' : '/bai-viet/cong-dong';

  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    {
      name: sectionLabel,
      url: sectionUrl,
    },
    {
      name: post.title,
      url: isCommunity
        ? `/bai-viet/cong-dong/${encodeURIComponent(slug)}`
        : `/bai-viet/series/${encodeURIComponent(slug)}`,
    },
  ]);


  return (
    <>
      <JsonLd data={[articleJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailView initialPost={post} />
      </Suspense>
    </>
  );
}
