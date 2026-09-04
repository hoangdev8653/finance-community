'use client';

import React, { useState } from 'react';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  X,
  EyeOff,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useModerationPosts, useApprovePost, useBanPost } from '@/lib/moderation/use-post-moderation';
import { useDeletePostFromAdmin, useUpdatePost } from '@/lib/posts/use-post-mutations';
import { ModerationPostItem } from '@/types/moderation';
import { AdminPagination } from './AdminPagination';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminCreatePostModal } from './AdminCreatePostModal';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { CoverImagePicker, registerCoverPreview } from '@/components/media/CoverImagePicker';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '@/lib/toast/ToastContext';
import { resolveMediaUrl } from '@/lib/utils/media';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { DEFAULT_POST_COVER } from '@/lib/constants/media';

type EditablePost = ModerationPostItem & { body?: string | null };
const fallbackCover = DEFAULT_POST_COVER;

export function AdminPostsTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EditablePost | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'delete' | 'hide' | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState('Vi phạm chính sách cộng đồng');

  // Search & Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [contentFilter, setContentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [moderationFilter, setModerationFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useModerationPosts({
    moderationStatus: 'ALL',
    page,
    limit: DEFAULT_PAGE_SIZE,
  });

  const deleteMutation = useDeletePostFromAdmin();
  const updateMutation = useUpdatePost(selected?.id ?? '');
  const approveMutation = useApprovePost();
  const banMutation = useBanPost();

  const posts = data?.data ?? [];
  const meta = data?.meta ?? {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const filtered = posts.filter((p) => {
    const q = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      !q || `${p.title} ${p.slug} ${p.author?.username ?? ''}`.toLowerCase().includes(q);
    const matchesContent = contentFilter === 'ALL' || p.contentType === contentFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesModeration =
      moderationFilter === 'ALL' || p.moderationStatus === moderationFilter;

    return matchesSearch && matchesContent && matchesStatus && matchesModeration;
  });

  const open = (post: ModerationPostItem, next: 'view' | 'edit' | 'delete' | 'hide') => {
    const item = post as EditablePost;
    registerCoverPreview(
      item.coverMedia?.id,
      resolveMediaUrl(item.coverMedia?.secureUrl || item.coverMedia?.id, fallbackCover)
    );
    setSelected(item);
    setMode(next);
    setTitle(item.title);
    setBody(item.body ?? '');
    setCoverMediaId(item.coverMedia?.id ?? null);
    setHideReason('Vi phạm quy định nội dung');
  };

  const close = () => {
    if (
      !deleteMutation.isPending &&
      !updateMutation.isPending &&
      !banMutation.isPending &&
      !approveMutation.isPending
    ) {
      setSelected(null);
      setMode(null);
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success('Đã xóa mềm bài viết thành công.');
      close();
      await refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể xóa bài viết.');
    }
  };

  const handleToggleHide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    try {
      if (selected.moderationStatus === 'BANNED') {
        // Unhide / Approve
        await approveMutation.mutateAsync(selected.id);
        toast.success(`Đã mở lại bài viết “${selected.title}”.`);
      } else {
        // Hide / Ban
        await banMutation.mutateAsync({
          id: selected.id,
          reason: hideReason.trim() || 'Tạm ẩn theo yêu cầu quản trị viên',
        });
        toast.success(`Đã tạm ẩn bài viết “${selected.title}”.`);
      }
      close();
      await refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể thay đổi trạng thái ẩn bài viết.');
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !title.trim()) return;

    try {
      await updateMutation.mutateAsync({
        title: title.trim(),
        body: body.trim() || undefined,
        coverMediaId: coverMediaId || undefined,
      });
      toast.success('Đã cập nhật bài viết thành công.');
      close();
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật bài viết.');
    }
  };

  const badge = (value: string) => (
    <Badge
      variant={
        value === 'APPROVED' || value === 'PUBLISHED'
          ? 'success'
          : value === 'BANNED' || value === 'HIDDEN'
          ? 'danger'
          : 'default'
      }
    >
      {value}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Quản lý bài viết</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Danh sách toàn bộ bài viết, kiểm duyệt, sửa đổi và các thao tác quản trị nội dung.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Thêm bài viết</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 lg:flex-row lg:items-center lg:justify-between">
        <AdminSearchInput
          value={search}
          onValueChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          isLoading={isLoading}
          placeholder="Tìm theo tiêu đề, slug hoặc tác giả..."
          aria-label="Tìm kiếm bài viết"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={contentFilter}
            onChange={(e) => {
              setContentFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo loại nội dung"
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">Tất cả loại</option>
            <option value="COMMUNITY">COMMUNITY</option>
            <option value="SERIES">SERIES</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo trạng thái bài viết"
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="HIDDEN">HIDDEN</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <select
            value={moderationFilter}
            onChange={(e) => {
              setModerationFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo trạng thái kiểm duyệt"
            className="h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">Tất cả kiểm duyệt</option>
            <option value="UNREVIEWED">UNREVIEWED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="BANNED">BANNED</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-mono uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Bài viết</th>
                <th className="px-4 py-3">Tác giả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày đăng</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Đang tải bài viết...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-danger">
                    Không thể tải danh sách bài viết. Vui lòng thử lại.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    {search ? 'Không có bài viết nào phù hợp với từ khóa.' : 'Không có bài viết nào.'}
                  </td>
                </tr>
              ) : (
                filtered.map((post) => {
                  const isBanned = post.moderationStatus === 'BANNED';
                  return (
                    <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveMediaUrl(post.coverMedia?.secureUrl, fallbackCover)}
                            alt=""
                            className="h-10 w-14 rounded-md object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{post.title}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              {post.slug}
                            </p>
                            <div className="mt-1 flex gap-1.5">
                              {badge(post.contentType)}
                              {badge(post.status)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        {post.author?.username || post.authorId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">{badge(post.moderationStatus)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(post.publishedAt || post.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {/* View Full Post */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => open(post, 'view')}
                            title="Xem chi tiết"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit Post */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => open(post, 'edit')}
                            title="Sửa bài viết"
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Hide / Unhide Post (Moderation Action) */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => open(post, 'hide')}
                            title={isBanned ? 'Mở lại bài viết' : 'Tạm ẩn bài viết'}
                            className={`h-8 w-8 p-0 ${
                              isBanned
                                ? 'text-success hover:text-success'
                                : 'text-amber-500 hover:text-amber-600'
                            }`}
                          >
                            {isBanned ? (
                              <ShieldCheck className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Soft Delete Post */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => open(post, 'delete')}
                            title="Xóa mềm bài viết"
                            className="h-8 w-8 p-0 text-danger hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          meta={meta}
          itemLabel="bài viết"
          pageLabel="Trang"
          onPageChange={setPage}
        />
      </div>

      {/* Create Modal */}
      <AdminCreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          await refetch();
        }}
      />

      {/* Action Dialogs */}
      {selected && mode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {mode === 'view'
                  ? 'Xem chi tiết bài viết'
                  : mode === 'edit'
                  ? 'Sửa bài viết'
                  : mode === 'hide'
                  ? selected.moderationStatus === 'BANNED'
                    ? 'Mở lại bài viết'
                    : 'Tạm ẩn bài viết (Kiểm duyệt)'
                  : 'Xóa mềm bài viết'}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Đóng"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* View Mode */}
            {mode === 'view' && (
              <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
                <img
                  src={resolveMediaUrl(selected.coverMedia?.secureUrl || selected.coverMedia?.id, fallbackCover)}
                  alt=""
                  className="max-h-80 w-full rounded-xl border border-border object-contain bg-muted"
                />
                <h3 className="text-xl font-bold text-foreground">{selected.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-muted-foreground">
                  <span>Slug: {selected.slug}</span>
                  <span>•</span>
                  <span>Tác giả: {selected.author?.username || selected.authorId}</span>
                  <span>•</span>
                  <span>Trạng thái: {selected.status}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm text-muted-foreground pt-2 border-t border-border">
                  {selected.body || 'Nội dung bài viết chưa được cập nhật.'}
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {mode === 'edit' && (
              <form onSubmit={update} className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
                <CoverImagePicker
                  value={coverMediaId}
                  fallbackPreviewUrl={resolveMediaUrl(
                    selected.coverMedia?.secureUrl || selected.coverMedia?.id,
                    fallbackCover
                  )}
                  onChange={setCoverMediaId}
                />
                <label className="block text-xs font-semibold text-foreground">
                  Tiêu đề
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold text-foreground">
                  Nội dung bài viết
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="mt-2 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button type="submit" isLoading={updateMutation.isPending}>
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            )}

            {/* Hide / Unhide Mode (Moderation) */}
            {mode === 'hide' && (
              <form onSubmit={handleToggleHide} className="space-y-4 p-6">
                {selected.moderationStatus === 'BANNED' ? (
                  <p className="text-sm text-muted-foreground">
                    Bài viết <strong>“{selected.title}”</strong> hiện đang bị ẩn. Bạn có muốn phục
                    hồi và phê duyệt cho bài viết hiển thị lại trên cộng đồng?
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Bạn đang thực hiện <strong>tạm ẩn</strong> bài viết{' '}
                      <strong>“{selected.title}”</strong> do vi phạm kiểm duyệt. Bài viết sẽ không bị
                      xóa vĩnh viễn và có thể khôi phục bất cứ lúc nào.
                    </p>
                    <label className="block text-xs font-semibold text-foreground">
                      Lý do kiểm duyệt / Ghi chú
                      <input
                        value={hideReason}
                        onChange={(e) => setHideReason(e.target.value)}
                        placeholder="e.g. Vi phạm chính sách cộng đồng, spam..."
                        className="mt-2 w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        required
                      />
                    </label>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant={selected.moderationStatus === 'BANNED' ? 'primary' : 'outline'}
                    className={
                      selected.moderationStatus === 'BANNED'
                        ? ''
                        : 'border-amber-500 text-amber-600 hover:bg-amber-500/10'
                    }
                    isLoading={banMutation.isPending || approveMutation.isPending}
                  >
                    {selected.moderationStatus === 'BANNED' ? 'Phục hồi bài viết' : 'Xác nhận ẩn bài'}
                  </Button>
                </div>
              </form>
            )}

            {/* Delete Mode (Soft Delete) */}
            {mode === 'delete' && (
              <div className="space-y-5 p-6">
                <p className="text-sm text-muted-foreground">
                  Bạn có chắc chắn muốn <strong>xóa mềm (soft-delete)</strong> bài viết{' '}
                  <strong>“{selected.title}”</strong>? Bài viết sẽ được đánh dấu đã xóa và không còn
                  hiển thị trong bảng điều khiển cũng như trên các luồng bảng tin.
                </p>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={close}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void remove()}
                    isLoading={deleteMutation.isPending}
                  >
                    Xóa bài viết
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
