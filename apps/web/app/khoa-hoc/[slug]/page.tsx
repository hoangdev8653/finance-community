import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { courseService } from '@/lib/courses/course-service';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { generateCourseItemListJsonLd, generateBreadcrumbsJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { CourseView } from '@/components/courses/CourseView';
import { CourseSkeleton } from '@/components/courses/CourseSkeleton';
import type { CourseDetailResponse } from '@/types/course';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const COURSE_ALIASES: Record<string, { seriesSlug: string; defaultTitle?: string; defaultDesc?: string; fallbackLessons?: Array<{ title: string; slug: string }> }> = {
  'quan-ly-tai-chinh-ca-nhan': {
    seriesSlug: 'tai-chinh-ca-nhan',
    defaultTitle: 'Quản lý Tài chính Cá nhân & Xây dựng Tự do Tài chính',
  },
  'dau-tu-chung-khoan-tu-nen-tang': {
    seriesSlug: 'chung-khoan',
    defaultTitle: 'Đầu tư Chứng khoán từ Nền tảng A-Z',
  },
  'nhap-mon-chung-khoan-tu-nen-tang': {
    seriesSlug: 'chung-khoan',
    defaultTitle: 'Nhập môn Đầu tư Chứng khoán từ Nền tảng',
  },
  'quy-du-phong-va-bao-hiem': {
    seriesSlug: 'tai-chinh-ca-nhan',
    defaultTitle: 'Quỹ Dự phòng & Bảo hiểm Cá nhân',
  },
  'doc-hieu-bao-cao-tai-chinh': {
    seriesSlug: 'chung-khoan',
    defaultTitle: 'Đọc hiểu Báo cáo Tài chính & Phân tích Doanh nghiệp',
  },
  'lam-viec-hieu-qua-trong-thoi-dai-so': {
    seriesSlug: 'ky-nang-song',
    defaultTitle: 'Làm việc Hiệu quả trong Thời đại Số',
    defaultDesc: 'Thiết kế hệ thống tập trung, ưu tiên đúng việc và làm việc bền vững.',
    fallbackLessons: [
      { title: 'Tư duy tổ chức công việc tinh gọn (Deep Work & GTD)', slug: 'tu-duy-to-chuc-cong-viec' },
      { title: 'Quản lý năng lượng thay vì quản lý thời gian', slug: 'quan-ly-nang-luong' },
      { title: 'Tối ưu hóa quy trình làm việc với công cụ số', slug: 'toi-uu-cong-cu-so' },
      { title: 'Xây dựng thói quen duy trì kỷ luật bản thân', slug: 'ky-luat-ban-than' },
    ],
  },
  'suc-khoe-tai-chinh-va-the-chat': {
    seriesSlug: 'suc-khoe-co-ban',
    defaultTitle: 'Sức khỏe Tài chính và Thể chất',
    defaultDesc: 'Tạo nhịp sống lành mạnh để duy trì năng lượng, hiệu suất và sự an tâm bền vững.',
    fallbackLessons: [
      { title: 'Mối liên hệ giữa căng thẳng tài chính và thể chất', slug: 'cang-thang-tai-chinh' },
      { title: 'Thiết lập lối sống cân bằng và dinh dưỡng khoa học', slug: 'loi-song-can-bang' },
      { title: 'Duy trì năng lượng bền bỉ cho ngày làm việc', slug: 'duy-tri-nang-luong' },
    ],
  },
  'ung-dung-ai-trong-cong-viec': {
    seriesSlug: 'tri-tue-nhan-tao',
    defaultTitle: 'Ứng dụng AI trong Công việc & Nghiên cứu',
    defaultDesc: 'Tận dụng các mô hình AI để nghiên cứu, phân tích dữ liệu và tối ưu tác vụ lặp lại.',
    fallbackLessons: [
      { title: 'Kỹ năng giao tiếp và đặt câu lệnh hiệu quả (Prompt Engineering)', slug: 'prompt-engineering-co-ban' },
      { title: 'Ứng dụng AI tổng hợp tin tức và báo cáo tài chính', slug: 'ai-tong-hop-bao-cao' },
      { title: 'Tự động hóa tác vụ lặp lại hàng ngày với AI', slug: 'tu-dong-hoa-ai' },
    ],
  },
  'giao-tiep-va-dam-phan': {
    seriesSlug: 'ky-nang-song',
    defaultTitle: 'Giao tiếp và Đàm phán Tự tin',
    defaultDesc: 'Rèn luyện kỹ năng trình bày, lắng nghe tích cực và xử lý các cuộc đối thoại quan trọng.',
    fallbackLessons: [
      { title: 'Nguyên lý lắng nghe thấu cảm và đặt câu hỏi mở', slug: 'lang-nghe-thau-cam' },
      { title: 'Chiến lược đàm phán đôi bên cùng có lợi (Win-Win)', slug: 'dam-phan-win-win' },
      { title: 'Xử lý mâu thuẫn và giữ bình tĩnh trong tranh luận', slug: 'xu-ly-mau-thuan' },
    ],
  },
};

async function getCourseData(slug: string): Promise<{
  seriesDetail: CourseDetailResponse;
  presentation?: { estimatedDurationMinutes: number | null; learningOutcomes: string[] };
} | null> {
  const alias = COURSE_ALIASES[slug];
  const targetSeriesSlug = alias?.seriesSlug || slug;

  // 1. Try fetching directly via learningCourseService
  let pathResult: any = null;
  try {
    const path = await learningCourseService.getPath(slug);
    if (path && path.series) {
      pathResult = path;
    }
  } catch {
    // try alias path if available
    if (alias && alias.seriesSlug !== slug) {
      try {
        const path = await learningCourseService.getPath(alias.seriesSlug);
        if (path && path.series) {
          pathResult = path;
        }
      } catch {
        // ignore
      }
    }
  }

  // 2. Try fetching series detail from courseService (has published articles)
  let seriesDetail: CourseDetailResponse | null = null;
  try {
    seriesDetail = await courseService.getBySlug(slug, { page: 1, limit: 50 });
  } catch {
    if (targetSeriesSlug !== slug) {
      try {
        seriesDetail = await courseService.getBySlug(targetSeriesSlug, { page: 1, limit: 50 });
      } catch {
        // ignore
      }
    }
  }

  // If pathResult exists, construct response and merge series articles if path lessons are empty
  if (pathResult && pathResult.series) {
    const p = pathResult;
    let articles = (p.lessons || []).map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      status: 'PUBLISHED' as const,
      publishedAt: null,
      viewCount: 0,
    }));

    if (articles.length === 0 && seriesDetail && seriesDetail.articles && seriesDetail.articles.length > 0) {
      articles = seriesDetail.articles;
    } else if (articles.length === 0 && alias?.fallbackLessons) {
      articles = alias.fallbackLessons.map((l, i) => ({
        id: `fallback-${slug}-${i}`,
        title: l.title,
        slug: l.slug,
        status: 'PUBLISHED' as const,
        publishedAt: null,
        viewCount: 100 + i * 25,
      }));
    }

    return {
      seriesDetail: {
        series: {
          id: p.series.id,
          name: alias?.defaultTitle || p.series.title,
          slug: slug,
          description: alias?.defaultDesc || p.series.description,
          sortOrder: 0,
          createdAt: p.series.createdAt,
        },
        articles,
        meta: {
          page: 1,
          limit: Math.max(1, articles.length),
          totalItems: articles.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      presentation: {
        estimatedDurationMinutes: p.series.estimatedDurationMinutes || (articles.length * 15),
        learningOutcomes: p.series.learningOutcomes || [],
      },
    };
  }

  // If seriesDetail was found from courseService
  if (seriesDetail && seriesDetail.series) {
    let articles = seriesDetail.articles || [];
    if (articles.length === 0 && alias?.fallbackLessons) {
      articles = alias.fallbackLessons.map((l, i) => ({
        id: `fallback-${slug}-${i}`,
        title: l.title,
        slug: l.slug,
        status: 'PUBLISHED' as const,
        publishedAt: null,
        viewCount: 100 + i * 25,
      }));
    }

    return {
      seriesDetail: {
        series: {
          ...seriesDetail.series,
          name: alias?.defaultTitle || seriesDetail.series.name,
          slug: slug,
          description: alias?.defaultDesc || seriesDetail.series.description,
        },
        articles,
        meta: {
          ...seriesDetail.meta,
          totalItems: Math.max(seriesDetail.meta.totalItems, articles.length),
        },
      },
      presentation: {
        estimatedDurationMinutes: articles.length * 15,
        learningOutcomes: [
          'Nắm vững kiến thức nền tảng và phương pháp thực tế',
          'Áp dụng ngay các kỹ năng vào tình huống thực tế hàng ngày',
          'Xây dựng tư duy logic, chủ động và phát triển bền vững',
        ],
      },
    };
  }

  // 3. Fallback for known course alias even if backend empty
  if (alias) {
    const articles = (alias.fallbackLessons || []).map((l, i) => ({
      id: `fallback-${slug}-${i}`,
      title: l.title,
      slug: l.slug,
      status: 'PUBLISHED' as const,
      publishedAt: null,
      viewCount: 120 + i * 15,
    }));

    return {
      seriesDetail: {
        series: {
          id: `alias-${slug}`,
          name: alias.defaultTitle || slug,
          slug: slug,
          description: alias.defaultDesc || 'Khóa học thực tế được xây dựng theo lộ trình rõ ràng trên BrewSeven.',
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        },
        articles,
        meta: {
          page: 1,
          limit: Math.max(1, articles.length),
          totalItems: articles.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      presentation: {
        estimatedDurationMinutes: articles.length * 15,
        learningOutcomes: [
          'Nắm vững kiến thức nền tảng của chủ đề',
          'Biết cách áp dụng vào công việc và cuộc sống',
          'Phát triển kỹ năng tự học và hoàn thiện bản thân',
        ],
      },
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCourseData(slug);
    if (!data) throw new Error('Not found');

    const title = `${data.seriesDetail.series.name} | Khóa học tài chính`;
    const description =
      data.seriesDetail.series.description ||
      'Khóa học thực tế được xây dựng theo lộ trình rõ ràng trên Finance Pulse.';
    const canonicalPath = `/khoa-hoc/${encodeURIComponent(slug)}`;

    return buildPageMetadata({
      title,
      description,
      canonicalPath,
      ogType: 'website',
      twitterCard: 'summary',
    });
  } catch {
    return buildPageMetadata({
      title: 'Không tìm thấy khóa học',
      noIndex: true,
    });
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const courseData = await getCourseData(slug);

  if (!courseData || !courseData.seriesDetail) {
    notFound();
  }

  const { seriesDetail, presentation } = courseData;

  // Schema.org ItemList and Breadcrumbs JSON-LD
  const itemListJsonLd = generateCourseItemListJsonLd(seriesDetail);
  const breadcrumbsJsonLd = generateBreadcrumbsJsonLd([
    { name: 'Trang chủ', url: '/' },
    { name: 'Khóa học', url: '/khoa-hoc' },
    {
      name: seriesDetail.series.name,
      url: `/khoa-hoc/${encodeURIComponent(slug)}`,
    },
  ]);

  return (
    <>
      <JsonLd data={[itemListJsonLd, breadcrumbsJsonLd]} />
      <Suspense fallback={<CourseSkeleton variant="detail" />}>
        <CourseView initialData={seriesDetail} slug={slug} presentation={presentation} />
      </Suspense>
    </>
  );
}
