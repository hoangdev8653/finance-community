import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = buildPageMetadata({
  title: 'Tra Cứu & Khám Phá Thị Trường',
  description:
    'Tìm kiếm và khám phá các bài phân tích tài chính, ghi chú nghiên cứu và mô hình định giá chuyên sâu.',
  noIndex: true,
  noFollow: false,
});


export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
