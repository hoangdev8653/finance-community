'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ExternalLink, Pencil, Trash2, FileText } from 'lucide-react';
import { useModerationPosts } from '@/lib/moderation/use-post-moderation';
import { useDeletePostFromAdmin } from '@/lib/posts/use-post-mutations';
import { AdminPagination } from './AdminPagination';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '@/lib/toast/ToastContext';
import { resolveMediaUrl } from '@/lib/utils/media';

const fallbackCover = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=320&h=220&auto=format&fit=crop&q=80';

export function AdminPostsTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useModerationPosts({ page, limit: 15 });
  const deleteMutation = useDeletePostFromAdmin();
  const posts = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, limit: 15, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Xóa mềm bài viết “${title}”?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa mềm bài viết.');
      await refetch();
    } catch {
      toast.error('Không thể xóa bài viết.');
    }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="h-5 w-5" /></div><h1 className="font-heading text-xl font-bold text-foreground">Quản lý bài viết</h1></div><p className="mt-1 text-xs text-muted-foreground font-mono">Danh sách toàn bộ bài viết và các thao tác quản trị nội dung.</p></div>
      <Button asChild size="sm"><Link href="/posts/create"><Plus className="h-4 w-4" />Thêm bài viết</Link></Button>
    </div>
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface/70 p-3 text-xs"><span className="font-semibold text-foreground">{meta.totalItems} bài viết</span><Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>Làm mới</Button></div>
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="border-b border-border bg-muted/50 font-mono uppercase text-muted-foreground"><tr><th className="px-4 py-3">Bài viết</th><th className="px-4 py-3">Tác giả</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày đăng</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-border">{isLoading ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Đang tải bài viết...</td></tr> : isError ? <tr><td colSpan={5} className="py-12 text-center text-danger">Không thể tải bài viết.</td></tr> : posts.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Chưa có bài viết.</td></tr> : posts.map(post => <tr key={post.id} className="hover:bg-muted/20"><td className="max-w-[460px] px-4 py-3"><div className="flex items-center gap-3"><img src={resolveMediaUrl(post.coverMedia?.secureUrl, fallbackCover)} alt="" className="h-10 w-14 rounded-md border border-border object-cover" /><div className="min-w-0"><p className="truncate font-semibold text-foreground" title={post.title}>{post.title}</p><p className="truncate font-mono text-xs text-muted-foreground">{post.slug}</p></div></div></td><td className="px-4 py-3 font-mono text-foreground">{post.author?.username || post.authorId.slice(0, 8)}</td><td className="px-4 py-3"><Badge variant={post.moderationStatus === 'APPROVED' ? 'success' : post.moderationStatus === 'BANNED' ? 'danger' : 'warning'}>{post.moderationStatus}</Badge></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(post.publishedAt || post.createdAt).toLocaleString('vi-VN')}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm" title="Mở bài viết"><Link href={`/posts/${post.slug}`} target="_blank"><ExternalLink className="h-3.5 w-3.5" /></Link></Button><Button asChild variant="outline" size="sm" title="Sửa bài viết"><Link href={`/posts/${post.contentType.toLowerCase()}/edit/${post.slug}`}><Pencil className="h-3.5 w-3.5" /></Link></Button><Button variant="outline" size="sm" title="Xóa mềm bài viết" onClick={() => void handleDelete(post.id, post.title)} disabled={deleteMutation.isPending} className="text-danger hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)}</tbody></table></div>
      <AdminPagination meta={meta} itemLabel="bài viết" pageLabel="Trang" onPageChange={setPage} />
    </div>
  </div>;
}
