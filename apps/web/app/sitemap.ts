import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site-config';
import { postsService } from '@/lib/posts/posts-service';
import { seriesService } from '@/lib/series/series-service';
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
      url: `${baseUrl}/posts`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Fetch published posts
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const postsResult = await postsService.getFeed({ limit: 100 });
    if (postsResult && Array.isArray(postsResult.data)) {
      postRoutes = postsResult.data
        .filter((post) => post.status === 'PUBLISHED' && post.slug)
        .map((post) => ({
          url: `${baseUrl}/posts/${post.contentType.toLowerCase()}/${encodeURIComponent(post.slug)}`,
          lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
          changeFrequency: 'weekly',
          priority: 0.9,
        }));
    }
  } catch {
    postRoutes = [];
  }

  // Fetch published series
  let seriesRoutes: MetadataRoute.Sitemap = [];
  try {
    const seriesResult = await seriesService.getAllSeries({ limit: 50 });
    if (seriesResult && Array.isArray(seriesResult.data)) {
      seriesRoutes = seriesResult.data
        .filter((series) => series.slug)
        .map((series) => ({
          url: `${baseUrl}/series/${encodeURIComponent(series.slug)}`,
          lastModified: new Date(series.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch {
    seriesRoutes = [];
  }

  // Fetch taxonomy tags
  let tagRoutes: MetadataRoute.Sitemap = [];
  try {
    const tags = await searchService.searchTags('', 50);
    if (Array.isArray(tags)) {
      tagRoutes = tags
        .filter((tag) => tag.slug)
        .map((tag) => ({
          url: `${baseUrl}/tags/${encodeURIComponent(tag.slug)}`,
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
