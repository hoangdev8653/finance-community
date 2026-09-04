'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalItems: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  pageLabel?: string;
  showPageNumbers?: boolean;
  scrollToTop?: boolean;
  className?: string;
}

export function Pagination({
  meta,
  onPageChange,
  itemLabel = 'mục',
  pageLabel = 'Trang',
  showPageNumbers = true,
  scrollToTop = false,
  className = '',
}: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const currentPage = meta.page || 1;
  const totalPages = meta.totalPages || 1;
  const limit = meta.limit || 10;

  const hasPrev = meta.hasPreviousPage ?? currentPage > 1;
  const hasNext = meta.hasNextPage ?? currentPage < totalPages;

  const handlePageClick = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    onPageChange(newPage);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers window (e.g. 5 pages centered around currentPage)
  const pageNumbers: number[] = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, meta.totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/10 px-4 py-3 text-xs font-mono select-none ${className}`}
      aria-label="Điều hướng phân trang"
    >
      {/* Information text */}
      <div className="text-muted-foreground text-[11px]">
        {pageLabel} <span className="font-bold text-foreground">{currentPage}</span> / {totalPages}
        {' '}({meta.totalItems > 0 ? `${startItem}-${endItem} trong ${meta.totalItems} ${itemLabel}` : `0 ${itemLabel}`})
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* First page button */}
        {showPageNumbers && totalPages > 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(1)}
            disabled={!hasPrev}
            title="Về trang đầu"
            aria-label="Về trang đầu"
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!hasPrev}
          title="Trang trước"
          aria-label="Trang trước"
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Numbered Page Buttons */}
        {showPageNumbers && (
          <>
            {startPage > 1 && (
              <span className="px-1 text-muted-foreground text-xs font-sans">...</span>
            )}

            {pageNumbers.map((p) => {
              const isCurrent = p === currentPage;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageClick(p)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`h-8 min-w-8 px-2.5 text-xs font-mono cursor-pointer ${
                    isCurrent ? 'font-bold shadow-2xs' : ''
                  }`}
                >
                  {p}
                </Button>
              );
            })}

            {endPage < totalPages && (
              <span className="px-1 text-muted-foreground text-xs font-sans">...</span>
            )}
          </>
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!hasNext}
          title="Trang kế tiếp"
          aria-label="Trang kế tiếp"
          className="h-8 w-8 p-0 cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last page button */}
        {showPageNumbers && totalPages > 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(totalPages)}
            disabled={!hasNext}
            title="Đến trang cuối"
            aria-label="Đến trang cuối"
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
