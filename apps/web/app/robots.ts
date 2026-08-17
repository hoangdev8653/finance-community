import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/moderation',
          '/moderation/',
          '/notifications',
          '/notifications/',
          '/posts/create',
          '/posts/*/edit',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
