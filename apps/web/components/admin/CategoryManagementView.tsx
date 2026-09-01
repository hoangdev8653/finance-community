'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { postsService } from '@/lib/posts/posts-service';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/admin/use-admin';
import { CategoryEntity } from '@/types/content';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FolderTree,
  Plus,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  Trash2,
} from 'lucide-react';
import { AdminSearchInput } from './AdminSearchInput';
import { AdminPagination } from './AdminPagination';

export function CategoryManagementView({ learningOnly = false }: { learningOnly?: boolean } = {}) {
  const domainLabels: Record<string, string> = { MONEY: 'Tài chính', BUSINESS: 'Kinh doanh', TECH: 'Công nghệ', CAREER: 'Nghề nghiệp & Học tập', LIFE: 'Đời sống', SPORTS: 'Thể thao', GENERAL: 'Khác' };
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'SERIES' | 'COMMUNITY'>(learningOnly ? 'SERIES' : 'ALL');
  const { data: categories, isLoading, isError, refetch } = useCategories(learningOnly ? 'SERIES' : scopeFilter === 'ALL' ? undefined : scopeFilter);
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => postsService.getDomains(),
    staleTime: 15 * 60 * 1000,
  });
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEntity | null>(null);
  const [scope, setScope] = useState<'SERIES' | 'COMMUNITY'>(learningOnly ? 'SERIES' : 'COMMUNITY');
  const [domainId, setDomainId] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const pageSize = 8;

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const openCreateModal = () => {
    setFeedback(null);
    setEditingCategory(null);
    setName('');
    setSlug('');
    setScope(learningOnly ? 'SERIES' : 'COMMUNITY');
    setDomainId(domains[0]?.id || '');
    setDescription('');
    setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryEntity) => {
    setFeedback(null);
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setScope(cat.scope as 'SERIES' | 'COMMUNITY');
    setDomainId(cat.domainId || '');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder || 0);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const filteredCategories = (categories ?? []).filter((category) => `${category.name} ${category.slug} ${category.description ?? ''}`.toLowerCase().includes(search.toLowerCase().trim()));
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const visibleCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);
  const paginationMeta = { page: Math.min(page, totalPages), limit: pageSize, totalItems: filteredCategories.length, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }

    if (!slug.trim()) {
      setFeedback({ type: 'error', message: 'Category slug is required.' });
      return;
    }

    if (!domainId) {
      setFeedback({ type: 'error', message: 'Category domain is required.' });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          dto: {
            name: name.trim(),
            slug: slug.trim(),
            domainId,
            description: description.trim() || undefined,
            sortOrder,
          },
        });
        setFeedback({
          type: 'success',
          message: `Category '${name}' updated successfully.`,
        });
      } else {
        await createCategoryMutation.mutateAsync({
          name: name.trim(),
          slug: slug.trim(),
          scope,
          domainId,
          contentTypes: [scope],
          description: description.trim() || undefined,
          sortOrder,
        });
        setFeedback({
          type: 'success',
          message: `Category '${name}' created successfully.`,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to save category.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (category: CategoryEntity) => {
    if (!window.confirm(`Xóa danh mục “${category.name}”? Các bài viết thuộc danh mục này sẽ không bị xóa.`)) return;
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      setFeedback({ type: 'success', message: `Đã xóa danh mục “${category.name}”.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Không thể xóa danh mục.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">
            Quản lý danh mục nội dung
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Thêm, chỉnh sửa và xóa danh mục cho chuỗi bài viết và cộng đồng.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="text-xs font-mono gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm danh mục</span>
        </Button>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 p-3.5 rounded-lg border text-xs font-medium ${
            feedback.type === 'error'
              ? 'bg-danger/10 border-danger/20 text-danger'
              : 'bg-success/10 border-success/20 text-success'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{filteredCategories.length} danh mục</span><span>•</span><span>Tất cả phạm vi nội dung</span></div>
        <div className="flex flex-col gap-2 sm:flex-row">{!learningOnly && <select value={scopeFilter} onChange={(event) => { setScopeFilter(event.target.value as 'ALL' | 'SERIES' | 'COMMUNITY'); setPage(1); }} aria-label="Lọc danh mục theo phạm vi" className="h-9 rounded-md border border-input bg-background px-3 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"><option value="ALL">Tất cả phạm vi</option><option value="COMMUNITY">COMMUNITY</option><option value="SERIES">SERIES</option></select>}<AdminSearchInput value={search} onValueChange={(value) => { setSearch(value); setPage(1); }} placeholder="Tìm theo tên hoặc slug..." aria-label="Tìm kiếm danh mục" /></div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-lg border border-danger/20 bg-danger/5 space-y-3"
        >
          <p className="text-sm font-medium text-foreground">
            Không thể tải danh sách danh mục.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-dashed border-border bg-surface space-y-2">
          <FolderTree className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Chưa có danh mục</h3>
          <p className="text-xs text-muted-foreground">
            Bắt đầu bằng cách tạo danh mục nội dung đầu tiên.
          </p>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border bg-surface p-2">
          {domains.map((domain) => {
            const domainCategories = filteredCategories.filter((category) => category.domainId === domain.id);
            if (!domainCategories.length) return null;
            const expanded = expandedDomains[domain.id] ?? false;
            return <div key={domain.id} className="overflow-hidden rounded-lg border border-border">
              <button type="button" onClick={() => setExpandedDomains((current) => ({ ...current, [domain.id]: !expanded }))} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40">
                <span><span className="font-semibold text-foreground">{domainLabels[domain.code] || domain.nameVi || domain.name}</span><span className="ml-2 text-xs text-muted-foreground">{domainCategories.length} danh mục</span></span>
                <span className="text-lg text-muted-foreground">{expanded ? '−' : '+'}</span>
              </button>
              {expanded && <div className="grid gap-2 border-t border-border bg-background/30 p-3 sm:grid-cols-2">{domainCategories.map((category) => <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{category.name}</p><p className="truncate font-mono text-[11px] text-muted-foreground">{category.slug}</p></div><div className="flex shrink-0 items-center gap-1.5"><Button variant="outline" size="sm" onClick={() => openEditModal(category)} className="h-7 px-2 text-xs">Sửa</Button><Button variant="outline" size="sm" onClick={() => void handleDelete(category)} className="h-7 px-2 text-xs text-danger">Xóa</Button></div></div>)}</div>}
            </div>;
          })}
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && (
        <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface">
          <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_140px_140px_190px] border-b border-border bg-muted/50 px-4 py-3 text-xs font-mono uppercase text-muted-foreground"><span>Danh mục</span><span>Slug</span><span>Phạm vi</span><span>Ngày tạo</span><span className="text-right">Thao tác</span></div>
          <div className="divide-y divide-border">
            {visibleCategories.map((cat) => (
              <div
                key={cat.id}
                className="grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_140px_140px_190px] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      {cat.name}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="truncate font-mono text-xs text-muted-foreground" title={cat.slug}>{cat.slug}</div>
                <div><Badge variant={cat.scope === 'SERIES' ? 'default' : 'secondary'} className="font-mono text-xs">{cat.scope}</Badge></div>
                <div className="text-xs text-muted-foreground">{new Date(cat.createdAt).toLocaleDateString('vi-VN')}</div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(cat)}
                    className="h-9 px-3 gap-1 font-mono text-xs"
                    title="Sửa danh mục"
                    aria-label={`Sửa danh mục ${cat.name}`}
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Sửa</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(cat)}
                    disabled={deleteCategoryMutation.isPending}
                    className="h-9 px-3 gap-1 font-mono text-xs text-danger hover:bg-danger/10"
                    title="Xóa danh mục"
                    aria-label={`Xóa danh mục ${cat.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Xóa</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <AdminPagination meta={paginationMeta} itemLabel="danh mục" pageLabel="Trang" onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h3 id="category-modal-title" className="font-heading text-base font-bold text-foreground">
                  {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="cat-name" className="text-xs font-semibold text-foreground">
                  Tên danh mục <span className="text-danger">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Fixed Income & Rates"
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-slug" className="text-xs font-semibold text-foreground">
                  URL Slug <span className="text-danger">*</span>
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. fixed-income-rates"
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              {!editingCategory && !learningOnly && (
                <div className="space-y-1">
                  <label htmlFor="cat-scope" className="text-xs font-semibold text-foreground">
                    Phạm vi nội dung
                  </label>
                  <select
                    id="cat-scope"
                    value={scope}
                    onChange={(e) => setScope(e.target.value as 'SERIES' | 'COMMUNITY')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="COMMUNITY">COMMUNITY (Community Discussions)</option>
                    
                    <option value="SERIES">SERIES (Curriculum Series)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="cat-domain" className="text-xs font-semibold text-foreground">
                  Domain <span className="text-danger">*</span>
                </label>
                <select
                  id="cat-domain"
                  value={domainId}
                  onChange={(e) => setDomainId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="">Select domain...</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-desc" className="text-xs font-semibold text-foreground">
                  Mô tả
                </label>
                <textarea
                  id="cat-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Analytical scope covered by this category..."
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary resize-y"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="cat-sort" className="text-xs font-semibold text-foreground">
                  Thứ tự hiển thị
                </label>
                <input
                  id="cat-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-md border border-input bg-background p-2 text-xs font-mono text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
