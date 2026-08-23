'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AdminPaginationMeta { page: number; totalPages: number; totalItems: number; hasNextPage: boolean; hasPreviousPage: boolean; }

interface AdminPaginationProps { meta: AdminPaginationMeta; itemLabel?: string; pageLabel?: string; onPageChange: (page: number) => void; }

export function AdminPagination({ meta, itemLabel = 'items', pageLabel = 'Page', onPageChange }: AdminPaginationProps) {
  if (meta.totalPages <= 1) return null;
  return <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{pageLabel} {meta.page} / {meta.totalPages} ({meta.totalItems} {itemLabel})</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label="Previous page" onClick={() => onPageChange(Math.max(1, meta.page - 1))} disabled={!meta.hasPreviousPage} className="h-8 px-2"><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="sm" aria-label="Next page" onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))} disabled={!meta.hasNextPage} className="h-8 px-2"><ChevronRight className="h-4 w-4" /></Button></div></div>;
}
