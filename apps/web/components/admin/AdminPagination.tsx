'use client';

import React from 'react';
import { Pagination, PaginationMeta } from '@/components/ui/Pagination';

export type AdminPaginationMeta = PaginationMeta;

export interface AdminPaginationProps {
  meta: AdminPaginationMeta;
  itemLabel?: string;
  pageLabel?: string;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export function AdminPagination({
  meta,
  itemLabel = 'mục',
  pageLabel = 'Trang',
  onPageChange,
  showPageNumbers = true,
}: AdminPaginationProps) {
  return (
    <Pagination
      meta={meta}
      onPageChange={onPageChange}
      itemLabel={itemLabel}
      pageLabel={pageLabel}
      showPageNumbers={showPageNumbers}
    />
  );
}
