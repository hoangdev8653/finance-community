'use client';

import React, { useState } from 'react';
import {
  useAdminTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/lib/admin/use-admin';
import { TagEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Hash,
  Search,
} from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminPagination } from './AdminPagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';

export function AdminTagsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data: tags = [], isLoading, isError, refetch } = useAdminTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagEntity | null>(null);
  const [tagName, setTagName] = useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagEntity | null>(null);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { toast } = useToast();

  const openCreateModal = () => {
    setFeedback(null);
    setEditingTag(null);
    setTagName('');
    setIsModalOpen(true);
  };

  const openEditModal = (tag: TagEntity) => {
    setFeedback(null);
    setEditingTag(tag);
    setTagName(tag.name);
    setIsModalOpen(true);
  };

  const filteredTags = tags.filter((tag) =>
    `${tag.name} ${tag.slug}`.toLowerCase().includes(search.toLowerCase().trim()),
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmed = tagName.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Tên thẻ không được để trống.' });
      return;
    }

    try {
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, dto: { name: trimmed } });
        toast.success('Cập nhật thẻ thành công.');
      } else {
        await createTagMutation.mutateAsync({ name: trimmed });
        toast.success('Tạo thẻ mới thành công.');
      }
      setIsModalOpen(false);
      setEditingTag(null);
      setTagName('');
      setFeedback(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setFeedback({ type: 'error', message: msg });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Quản lý thẻ (Tags)
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Phân loại nội dung, theo dõi tần suất sử dụng và quản trị thẻ trong toàn hệ thống.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Thêm thẻ mới
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tổng số thẻ</p>
              <p className="text-2xl font-bold text-foreground">{tags.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tổng lượt gắn thẻ</p>
              <p className="text-2xl font-bold text-foreground">{totalUsages}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Kết quả tìm kiếm</p>
              <p className="text-2xl font-bold text-foreground">{filteredTags.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearchInput
          value={search}
          onValueChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Tìm kiếm theo tên thẻ hoặc slug..."
        />
      </div>

      {/* Table / Content */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Đang tải danh sách thẻ...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">Không thể tải danh sách thẻ.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Thử lại
            </Button>
          </div>
        ) : visibleTags.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {search ? 'Không tìm thấy thẻ nào phù hợp.' : 'Chưa có thẻ nào trong hệ thống.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Tên thẻ</th>
                  <th className="px-4 py-3 sm:px-6">Đường dẫn (Slug)</th>
                  <th className="px-4 py-3 text-center sm:px-6">Lượt sử dụng</th>
                  <th className="px-4 py-3 sm:px-6">Ngày tạo</th>
                  <th className="px-4 py-3 text-right sm:px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleTags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Hash className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-foreground">{tag.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground sm:px-6">
                      /{tag.slug}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center sm:px-6">
                      <Badge variant="outline" className="font-mono text-xs">
                        {tag.usageCount || 0} bài viết
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground sm:px-6">
                      {tag.createdAt
                        ? new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(tag.createdAt))
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(tag)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          aria-label="Chỉnh sửa thẻ"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmTag(tag)}
                          className="h-8 w-8 p-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Xóa thẻ"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <AdminPagination
          meta={paginationMeta}
          itemLabel="thẻ"
          pageLabel="Trang"
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingTag ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tên thẻ
                </label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ví dụ: tài-chính-cá-nhân, cổ-phiếu"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Hệ thống sẽ tự động chuẩn hoá slug từ tên thẻ.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createTagMutation.isPending || updateTagMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createTagMutation.isPending || updateTagMutation.isPending}
                >
                  {createTagMutation.isPending || updateTagMutation.isPending
                    ? 'Đang lưu...'
                    : editingTag
                    ? 'Cập nhật'
                    : 'Tạo thẻ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Xác nhận xóa thẻ?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa thẻ{' '}
              <strong className="text-foreground font-semibold">#{deleteConfirmTag.name}</strong>?
              {deleteConfirmTag.usageCount > 0 && (
                <span className="mt-1 block text-amber-600 font-medium">
                  Thẻ này hiện đang được gắn trên {deleteConfirmTag.usageCount} bài viết.
                </span>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmTag(null)}
                disabled={deleteTagMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTagMutation.isPending}
              >
                {deleteTagMutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
