import React from 'react';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import {
  generateCollectionPageJsonLd,
  generateBreadcrumbsJsonLd,
} from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/JsonLd';
import { CategoriesDirectoryView } from '@/components/categories/CategoriesDirectoryView';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Sectors & Categories',
  description:
    'Explore financial research sectors, macroeconomic categories, and structured educational curriculums authored across Finance Pulse.',
  canonicalPath: '/categories',
});

export default function CategoriesPage() {
  const collectionSchema = generateCollectionPageJsonLd(
    'Research Categories & Sectors',
    'Structured catalog of financial research sectors and educational curriculums on Finance Pulse.',
    '/categories'
  );

  const breadcrumbsSchema = generateBreadcrumbsJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
  ]);

  return (
    <AppShell>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbsSchema} />
      <div className="space-y-6">
        <CategoriesDirectoryView />
      </div>
    </AppShell>
  );
}
