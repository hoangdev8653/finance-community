'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useModerationPosts,
  useApprovePost,
  useBanPost,
} from '../../lib/moderation/use-post-moderation';
import { ModerationPostItem, PostModerationStatus } from '../../types/moderation';
import { BanPostDialog } from './BanPostDialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ShieldCheck,
  ShieldBan,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../lib/toast/ToastContext';

export function PostModerationTable() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postToBan, setPostToBan] = useState<ModerationPostItem | null>(null);

  const { data, isLoading, isError, refetch } = useModerationPosts({
    moderationStatus: selectedStatus === 'ALL' ? undefined : (selectedStatus as PostModerationStatus),
    page: currentPage,
    limit: 15,
  });

  const approveMutation = useApprovePost();
  const banMutation = useBanPost();

  const posts = data?.data || [];
  const meta = data?.meta;

  const handleStatusTab = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleApprove = async (post: ModerationPostItem) => {
    try {
      await approveMutation.mutateAsync(post.id);
      toast.success(`Đã phê duyệt bài viết: "${post.title.slice(0, 30)}..."`);
    } catch {
      toast.error('Không thể phê duyệt bài viết.');
    }
  };

  const handleConfirmBan = async (reason: string) => {
    if (!postToBan) return;
    try {
      await banMutation.mutateAsync({ id: postToBan.id, reason });
      toast.success(`Đã cấm bài viết: "${postToBan.title.slice(0, 30)}..."`);
      setPostToBan(null);
    } catch {
      toast.error('Không thể cấm bài viết.');
    }
  };

  const getStatusBadge = (status: PostModerationStatus) => {
    switch (status) {
      case 'UNREVIEWED':
        return (
          <Badge variant="warning" className="inline-flex items-center gap-1 font-mono text-2xs">
            <Clock className="h-3 w-3" />
            <span>Chưa xem</span>
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="success" className="inline-flex items-center gap-1 font-mono text-2xs">
            <CheckCircle2 className="h-3 w-3" />
            <span>Đã duyệt</span>
          </Badge>
        );
      case 'BANNED':
        return (
          <Badge variant="danger" className="inline-flex items-center gap-1 font-mono text-2xs">
            <AlertCircle className="h-3 w-3" />
            <span>Đã cấm</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-xl font-bold text-foreground">
              Hàng đợi Kiểm duyệt Bài viết
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Duyệt các bài viết mới đăng hoặc khóa các bài viết vi phạm chính sách cộng đồng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg self-start sm:self-auto text-xs font-mono">
          {[
            { key: 'UNREVIEWED', label: 'Chưa xem' },
            { key: 'APPROVED', label: 'Đã duyệt' },
            { key: 'BANNED', label: 'Đã cấm' },
            { key: 'ALL', label: 'Tất cả' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-md transition-all font-semibold ${
                selectedStatus === tab.key
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-mono text-2xs uppercase">
              <tr>
                <th className="py-3 px-4">Bài viết</th>
                <th className="py-3 px-4">Tác giả</th>
                <th className="py-3 px-4">Ngày đăng</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Lý do cấm / Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    Đang tải danh sách bài viết...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-danger font-mono text-xs">
                    Không thể tải dữ liệu kiểm duyệt. Vui lòng thử lại.
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    Không có bài viết nào trong trạng thái này.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 text-2xs font-mono text-muted-foreground">
                            <span>{post.contentType}</span>
                            <span>•</span>
                            <span className="truncate">{post.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                      {post.author?.username || post.authorId.slice(0, 8)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-2xs text-muted-foreground whitespace-nowrap">
                      {post.publishedAt || post.createdAt
                        ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Bản nháp'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(post.moderationStatus)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-muted-foreground text-xs">
                      {post.moderationReason ? (
                        <p className="line-clamp-2 text-danger/90 font-mono text-2xs">
                          {post.moderationReason}
                        </p>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono text-2xs">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-2xs font-mono"
                          title="Xem bài viết"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        {post.moderationStatus !== 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(post)}
                            disabled={approveMutation.isPending}
                            className="inline-flex items-center gap-1 text-2xs h-7 px-2.5"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Duyệt</span>
                          </Button>
                        )}

                        {post.moderationStatus !== 'BANNED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPostToBan(post)}
                            disabled={banMutation.isPending}
                            className="inline-flex items-center gap-1 text-2xs h-7 px-2.5"
                          >
                            <ShieldBan className="h-3.5 w-3.5" />
                            <span>Cấm</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20 font-mono text-xs">
            <span className="text-muted-foreground">
              Trang {meta.page} / {meta.totalPages} ({meta.totalItems} bài viết)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="h-7 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ban Dialog */}
      {postToBan && (
        <BanPostDialog
          post={postToBan}
          isOpen={!!postToBan}
          onClose={() => setPostToBan(null)}
          onConfirm={handleConfirmBan}
          isLoading={banMutation.isPending}
        />
      )}
    </div>
  );
}
