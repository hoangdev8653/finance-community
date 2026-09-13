import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site-config';
import { postsService } from '@/lib/posts/posts-service';
import { courseService } from '@/lib/courses/course-service';
import { searchService } from '@/lib/search/search-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const currentDate = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bai-viet`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bai-viet/cong-dong`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/the`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/khoa-hoc`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Fetch published series first so each lesson can use its nested canonical URL.
  let seriesRoutes: MetadataRoute.Sitemap = [];
  const seriesById = new Map<string, string>();
  try {
    const seriesResult = await courseService.getAllCourses({ limit: 50 });
    if (seriesResult && Array.isArray(seriesResult.data)) {
      seriesResult.data.forEach((series) => seriesById.set(series.id, series.slug));
      seriesRoutes = seriesResult.data
        .filter((series) => series.slug)
        .map((series) => ({
          url: `${baseUrl}/khoa-hoc/${encodeURIComponent(series.slug)}`,
          lastModified: new Date(series.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch {
    seriesRoutes = [];
  }

  // Fetch published posts.
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const postsResult = await postsService.getFeed({ limit: 100 });
    if (postsResult && Array.isArray(postsResult.data)) {
      postRoutes = postsResult.data.reduce<MetadataRoute.Sitemap>((routes, post) => {
        if (post.status !== 'PUBLISHED' || !post.slug) return routes;

        const seriesSlug = post.categoryId
          ? seriesById.get(post.categoryId)
          : undefined;
        const path = post.contentType === 'COMMUNITY'
          ? `/bai-viet/cong-dong/${encodeURIComponent(post.slug)}`
          : post.contentType === 'SERIES' && seriesSlug
            ? `/khoa-hoc/${encodeURIComponent(seriesSlug)}/${encodeURIComponent(post.slug)}`
            : null;

        if (path) {
          routes.push({
            url: `${baseUrl}${path}`,
            lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
            changeFrequency: 'weekly',
            priority: 0.9,
          });
        }
        return routes;
      }, []);
    }
  } catch {
    postRoutes = [];
  }

  // Fetch taxonomy tags
  let tagRoutes: MetadataRoute.Sitemap = [];
  try {
    const tags = await searchService.searchTags('', 50);
    if (Array.isArray(tags)) {
      tagRoutes = tags
        .filter((tag) => tag.slug)
        .map((tag) => ({
          url: `${baseUrl}/the/${encodeURIComponent(tag.slug)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
    }
  } catch {
    tagRoutes = [];
  }

  return [...staticRoutes, ...postRoutes, ...seriesRoutes, ...tagRoutes];
}
