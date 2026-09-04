'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useAdminComments,
  useUpdateCommentStatus,
} from '@/lib/admin/use-admin';
import { AdminCommentEntity } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  FileText,
  User,
} from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminPagination } from './AdminPagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';

export function AdminCommentsTable() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, isLoading, isError, refetch } = useAdminComments({
    page,
    limit: pageSize,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    search: search.trim() || undefined,
  });

  const updateStatusMutation = useUpdateCommentStatus();

  const comments = data?.data || [];
  const meta = data?.meta ?? {
    page: 1,
    limit: pageSize,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // State for modal
  const [viewingComment, setViewingComment] = useState<AdminCommentEntity | null>(null);
  const [actionComment, setActionComment] = useState<{
    comment: AdminCommentEntity;
    targetStatus: 'VISIBLE' | 'HIDDEN';
  } | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  const handleStatusTab = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleConfirmAction = async () => {
    if (!actionComment) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: actionComment.comment.id,
        dto: {
          status: actionComment.targetStatus,
          reason: actionReason.trim() || undefined,
        },
      });
      toast.success(
        actionComment.targetStatus === 'VISIBLE'
          ? 'Đã hiển thị lại bình luận.'
          : 'Đã ẩn bình luận vi phạm thành công.'
      );
      setActionComment(null);
      setActionReason('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái bình luận.');
    }
  };

  const getStatusBadge = (status: 'VISIBLE' | 'HIDDEN') => {
    switch (status) {
      case 'VISIBLE':
        return (
          <Badge variant="success" className="inline-flex items-center gap-1 font-mono text-xs">
            <CheckCircle2 className="h-3 w-3" />
            <span>Hiển thị</span>
          </Badge>
        );
      case 'HIDDEN':
        return (
          <Badge variant="danger" className="inline-flex items-center gap-1 font-mono text-xs">
            <EyeOff className="h-3 w-3" />
            <span>Đã ẩn</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Quản lý bình luận
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Kiểm duyệt nội dung trao đổi, ẩn các bình luận vi phạm và duy trì văn hóa thảo luận lành mạnh.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/30 p-1">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'VISIBLE', label: 'Đang hiển thị' },
            { key: 'HIDDEN', label: 'Đã ẩn' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleStatusTab(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatus === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AdminSearchInput
          value={search}
          onValueChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Tìm theo nội dung, tác giả, bài viết..."
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Đang tải danh sách bình luận...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">Không thể tải danh sách bình luận.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              Thử lại
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {search ? 'Không tìm thấy bình luận nào phù hợp.' : 'Không có bình luận nào.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Tác giả</th>
                  <th className="px-4 py-3 sm:px-6">Nội dung bình luận</th>
                  <th className="px-4 py-3 sm:px-6">Bài viết</th>
                  <th className="px-4 py-3 sm:px-6">Trạng thái</th>
                  <th className="px-4 py-3 sm:px-6">Thời gian</th>
                  <th className="px-4 py-3 text-right sm:px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comments.map((comment) => (
                  <tr key={comment.id} className="transition-colors hover:bg-muted/30">
                    {/* Author */}
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {comment.authorDisplayName || comment.authorUsername || 'Người dùng'}
                          </p>
                          {comment.authorUsername && (
                            <p className="text-xs text-muted-foreground">
                              @{comment.authorUsername}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Body Preview */}
                    <td className="max-w-xs px-4 py-3 sm:max-w-md sm:px-6">
                      <p className="line-clamp-2 text-sm text-foreground/90">
                        {comment.body}
                      </p>
                      {comment.body.length > 100 && (
                        <button
                          type="button"
                          onClick={() => setViewingComment(comment)}
                          className="mt-1 text-xs font-medium text-primary hover:underline"
                        >
                          Xem toàn bộ
                        </button>
                      )}
                    </td>

                    {/* Post */}
                    <td className="max-w-xs px-4 py-3 sm:px-6">
                      <p className="line-clamp-1 text-xs font-medium text-foreground">
                        {comment.postTitle || `Bài viết #${comment.postId.slice(0, 8)}`}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                      {getStatusBadge(comment.status)}
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground sm:px-6">
                      {new Intl.DateTimeFormat('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(comment.createdAt))}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingComment(comment)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          aria-label="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {comment.status === 'VISIBLE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionComment({ comment, targetStatus: 'HIDDEN' })
                            }
                            className="h-8 w-8 p-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Ẩn bình luận"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActionComment({ comment, targetStatus: 'VISIBLE' })
                            }
                            className="h-8 w-8 p-0 text-emerald-600/70 hover:bg-emerald-500/10 hover:text-emerald-600"
                            aria-label="Bỏ ẩn bình luận"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
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
          meta={meta}
          itemLabel="bình luận"
          pageLabel="Trang"
          onPageChange={setPage}
        />
      </div>

      {/* View Full Comment Modal */}
      {viewingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Chi tiết bình luận</h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingComment(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tác giả: <strong className="text-foreground">{viewingComment.authorDisplayName || viewingComment.authorUsername}</strong></span>
                  <span>{getStatusBadge(viewingComment.status)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Bài viết: <strong className="text-foreground">{viewingComment.postTitle || viewingComment.postId}</strong>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Thời gian: {new Date(viewingComment.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nội dung bình luận
                </label>
                <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm text-foreground">
                  {viewingComment.body}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setViewingComment(null)}>
                  Đóng
                </Button>
                {viewingComment.status === 'VISIBLE' ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const target = viewingComment;
                      setViewingComment(null);
                      setActionComment({ comment: target, targetStatus: 'HIDDEN' });
                    }}
                  >
                    Ẩn bình luận này
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      const target = viewingComment;
                      setViewingComment(null);
                      setActionComment({ comment: target, targetStatus: 'VISIBLE' });
                    }}
                  >
                    Bỏ ẩn bình luận
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {actionComment.targetStatus === 'HIDDEN'
                ? 'Xác nhận ẩn bình luận?'
                : 'Xác nhận hiển thị lại bình luận?'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {actionComment.targetStatus === 'HIDDEN'
                ? 'Bình luận này sẽ không còn hiển thị đối với người dùng thông thường.'
                : 'Bình luận này sẽ được khôi phục hiển thị công khai trên bài viết.'}
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lý do thực hiện (tùy chọn)
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm quy chuẩn cộng đồng, spam..."
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionComment(null);
                  setActionReason('');
                }}
                disabled={updateStatusMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant={actionComment.targetStatus === 'HIDDEN' ? 'destructive' : 'primary'}
                size="sm"
                onClick={handleConfirmAction}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending
                  ? 'Đang xử lý...'
                  : actionComment.targetStatus === 'HIDDEN'
                  ? 'Ẩn bình luận'
                  : 'Bỏ ẩn'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
