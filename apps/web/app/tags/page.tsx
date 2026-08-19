import React from 'react';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { TagsDirectoryView } from '@/components/tags/TagsDirectoryView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Market Taxonomy & Financial Tags',
  description:
    'Browse all financial taxonomy tags, sector markers, and market topics cataloged across community analyses and educational series on Finance Pulse.',
  canonicalPath: '/tags',
});

export default function TagsPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Market Taxonomy & Research Tags',
    'Complete catalog of market tags, asset classes, and financial topics on Finance Pulse.',
    '/tags'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Market Tags', url: '/tags' },
  ]);

  return (
    <AppShell>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="space-y-6">
        <TagsDirectoryView />
      </div>
    </AppShell>
  );
}
