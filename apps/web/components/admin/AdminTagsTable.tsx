'use client';

import React, { useState, useMemo } from 'react';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import {
  useAdminTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/lib/admin/use-admin';
import { TagEntity } from '@/types/content';
import { Button } from '@/components/ui/Button';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Hash,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { AdminPagination } from './AdminPagination';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';

export function AdminTagsTable() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'USED' | 'UNUSED'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'usages' | 'name'>('latest');
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data: tags = [], isLoading, isError, isRefetching, refetch } = useAdminTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagEntity | null>(null);
  const [tagName, setTagName] = useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagEntity | null>(null);

  const { toast } = useToast();

  const openCreateModal = () => {
    setEditingTag(null);
    setTagName('');
    setIsModalOpen(true);
  };

  const openEditModal = (tag: TagEntity) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setIsModalOpen(true);
  };

  const filteredTags = useMemo(() => {
    let result = tags.filter((tag) => {
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !q || `${tag.name} ${tag.slug}`.toLowerCase().includes(q);
      const usages = tag.usageCount || 0;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'USED' && usages > 0) ||
        (statusFilter === 'UNUSED' && usages === 0);
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'usages') {
      result = [...result].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'latest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }
    return result;
  }, [tags, debouncedSearch, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleTags = filteredTags.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const paginationMeta = {
    page: currentPage,
    limit: pageSize,
    totalItems: filteredTags.length,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  const totalUsages = tags.reduce((acc, t) => acc + (t.usageCount || 0), 0);

  const generateSlugPreview = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = tagName.trim();
    if (!trimmed) {
      toast.error('Tên thẻ không được để trống.');
      return;
    }

    try {
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, dto: { name: trimmed } });
        toast.success(`Đã cập nhật thẻ “#${trimmed}” thành công.`);
      } else {
        await createTagMutation.mutateAsync({ name: trimmed });
        toast.success(`Đã tạo thẻ mới “#${trimmed}” thành công.`);
      }
      setIsModalOpen(false);
      setEditingTag(null);
      setTagName('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTag) return;
    try {
      await deleteTagMutation.mutateAsync(deleteConfirmTag.id);
      toast.success(`Đã xóa thẻ #${deleteConfirmTag.name}.`);
      setDeleteConfirmTag(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa thẻ này.');
    }
  };

  const isSubmitting = createTagMutation.isPending || updateTagMutation.isPending;

  return (
    <div className="tags-surface space-y-6">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý thẻ (Tags)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phân loại nội dung, theo dõi tần suất sử dụng và quản trị thẻ trong toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            onClick={openCreateModal}
            className="h-10 gap-2 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm thẻ mới</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isLoading || isRefetching}
            className="h-10 gap-2 rounded-[8px] border-slate-200/80 bg-white dark:bg-card dark:border-border px-4 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </Button>
        </div>
      </div>

      {/* 2. Metric Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Hash className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">Tổng số thẻ</p>
            <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
              {tags.length.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Tag className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">Tổng lượt gắn thẻ</p>
            <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
              {totalUsages.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Search className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">Kết quả tìm kiếm</p>
            <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
              {filteredTags.length.toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Main Card Container: Tabs + Filter Toolbar + Table View */}
      <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden">
        {/* Status Navigation Tabs (Matching CategoryManagementView & DomainManagementView) */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-border/60 px-4 sm:px-5 scrollbar-none">
          {[
            { label: 'Tất cả thẻ', value: 'ALL' as const, count: tags.length },
            {
              label: 'Đang gắn bài',
              value: 'USED' as const,
              count: tags.filter((t) => (t.usageCount || 0) > 0).length,
            },
            {
              label: 'Chưa sử dụng',
              value: 'UNUSED' as const,
              count: tags.filter((t) => !t.usageCount || t.usageCount === 0).length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`relative shrink-0 border-b-2 px-4 py-3.5 text-xs sm:text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-emerald-600 font-semibold text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>{' '}
                <span className="tabular-nums opacity-80 text-xs">
                  ({tab.count.toLocaleString('vi-VN')})
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar (Clean, properly bounded, responsive) */}
        <div className="flex flex-col gap-3 p-4 sm:px-5 sm:py-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-slate-900/30">
          <AdminSearchInput value={search} onValueChange={(value) => { setSearch(value); setPage(1); }} placeholder="Tên thẻ hoặc slug..." aria-label="Tìm kiếm thẻ" fullWidth containerClassName="min-w-[220px] flex-1" />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sắp xếp danh sách thẻ"
                className="h-10 rounded-[8px] border border-slate-200/80 dark:border-border bg-white dark:bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              >
                <option value="latest">Mới tạo nhất</option>
                <option value="usages">Gắn nhiều nhất</option>
                <option value="name">Tên thẻ (A → Z)</option>
              </select>
            </div>

            {/* Results counter badge */}
            <div className="rounded-[8px] bg-white dark:bg-card border border-slate-200/70 dark:border-border px-3 py-2 text-xs text-muted-foreground shadow-2xs font-mono tabular-nums whitespace-nowrap">
              <span>{visibleTags.length}</span>
              <span className="text-muted-foreground/60"> / </span>
              <span className="font-semibold text-foreground">{filteredTags.length}</span> thẻ
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Đang tải danh sách thẻ...</span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-rose-500" />
            <p className="text-xs font-semibold text-foreground">Không thể tải danh sách thẻ.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-4 rounded-[8px] text-xs">
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && visibleTags.length === 0 && (
          <div className="p-12 text-center text-xs text-muted-foreground">
            {search ? 'Không tìm thấy thẻ nào phù hợp.' : 'Chưa có thẻ nào trong hệ thống.'}
          </div>
        )}

        {/* Table View (Harmonized with DomainManagementView and CategoryManagementView) */}
        {!isLoading && !isError && visibleTags.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-border/60 text-slate-700 dark:text-slate-200 text-sm font-bold">
                <tr>
                  <th className="py-3.5 px-5">Tên thẻ</th>
                  <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                  <th className="py-3.5 px-4 text-center">Lượt sử dụng</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                {visibleTags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors group"
                  >
                    <td className="whitespace-nowrap py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/60">
                          #
                        </span>
                        <span className="font-heading text-sm font-semibold text-foreground">
                          {tag.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                      /{tag.slug}
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 text-center">
                      <span className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-border bg-slate-100/70 dark:bg-muted px-2.5 py-0.5 text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {tag.usageCount || 0} bài viết
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 font-mono text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {tag.createdAt
                        ? new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(tag.createdAt))
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(tag)}
                          className="h-9 gap-1.5 rounded-[6px] border-slate-200/80 dark:border-border px-3 text-sm font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-muted"
                          aria-label={`Chỉnh sửa thẻ ${tag.name}`}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Sửa</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmTag(tag)}
                          className="h-9 gap-1.5 rounded-[6px] border-rose-200/70 dark:border-rose-900/60 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                          aria-label={`Xóa thẻ ${tag.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-border/60 p-4">
            <AdminPagination
              meta={paginationMeta}
              itemLabel="thẻ"
              pageLabel="Trang"
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* 4. Modal: Thêm / Sửa Thẻ */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="relative w-full max-w-2xl rounded-[10px] border border-slate-100 dark:border-border bg-white dark:bg-card p-7 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    {editingTag ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Quản lý định danh thẻ phân loại bài viết.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-[6px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Tên thẻ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ví dụ: tài-chính-cá-nhân, cổ-phiếu, đầu-tư"
                  className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  autoFocus
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Đường dẫn (Slug tự động):</span>
                  <code className="rounded-[6px] bg-slate-100 dark:bg-muted px-2.5 py-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    /{tagName ? generateSlugPreview(tagName) : '...'}
                  </code>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-[8px] h-11 px-5 text-sm font-medium"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-[8px] h-11 px-6 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingTag ? 'Lưu thay đổi' : 'Tạo thẻ'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirmTag && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="relative w-full max-w-md rounded-[10px] border border-slate-100 dark:border-border bg-white dark:bg-card p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Xác nhận xóa thẻ
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Thao tác này không thể hoàn tác.
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Bạn có chắc muốn xóa thẻ{' '}
              <strong className="font-semibold text-rose-600 dark:text-rose-400">
                #{deleteConfirmTag.name}
              </strong>
              ? Thẻ này sẽ được gỡ khỏi tất cả các bài viết liên quan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmTag(null)}
                disabled={deleteTagMutation.isPending}
                className="rounded-[8px] h-10 px-4 text-xs font-medium"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleDelete()}
                disabled={deleteTagMutation.isPending}
                className="rounded-[8px] h-10 px-4 text-xs font-semibold"
              >
                {deleteTagMutation.isPending ? 'Đang xóa...' : 'Xóa thẻ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
