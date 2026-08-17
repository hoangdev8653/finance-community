import { describe, it, expect } from 'vitest';
import robots from '@/app/robots';
import { getSiteUrl } from '@/lib/seo/site-config';

describe('Robots.txt Generator', () => {
  it('generates correct rules allowing public routes and disallowing private routes', () => {
    const result = robots();

    expect(result.rules).toBeDefined();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rules.userAgent).toBe('*');
    expect(rules.allow).toBe('/');

    const disallowList = Array.isArray(rules.disallow)
      ? rules.disallow
      : [rules.disallow];

    expect(disallowList).toContain('/admin');
    expect(disallowList).toContain('/admin/');
    expect(disallowList).toContain('/moderation');
    expect(disallowList).toContain('/moderation/');
    expect(disallowList).toContain('/notifications');
    expect(disallowList).toContain('/notifications/');
    expect(disallowList).toContain('/posts/create');
    expect(disallowList).toContain('/posts/*/edit');
    expect(disallowList).toContain('/api/');
  });

  it('points to the correct sitemap URL', () => {
    const result = robots();
    const expectedSitemap = `${getSiteUrl()}/sitemap.xml`;
    expect(result.sitemap).toBe(expectedSitemap);
  });
});
