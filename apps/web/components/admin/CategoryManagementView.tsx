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
import { useDebounce } from '@/lib/hooks/use-debounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';

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
  const debouncedSearch = useDebounce(search, 350);
  const [page, setPage] = useState(1);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const pageSize = DEFAULT_PAGE_SIZE;

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

  const filteredCategories = (categories ?? []).filter((category) => `${category.name} ${category.slug} ${category.description ?? ''}`.toLowerCase().includes(debouncedSearch.toLowerCase().trim()));
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const visibleCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);
  const { toast } = useToast();
  const paginationMeta = { page: Math.min(page, totalPages), limit: pageSize, totalItems: filteredCategories.length, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      const msg = 'Vui lòng nhập tên danh mục.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (!slug.trim()) {
      const msg = 'Vui lòng nhập đường dẫn (slug) danh mục.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    if (!domainId) {
      const msg = 'Vui lòng chọn lĩnh vực cho danh mục.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
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
        const feedbackMsg = `Category '${name}' updated successfully.`;
        setFeedback({ type: 'success', message: feedbackMsg });
        toast.success(`Đã cập nhật danh mục “${name}”.`);
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
        const feedbackMsg = `Category '${name}' created successfully.`;
        setFeedback({ type: 'success', message: feedbackMsg });
        toast.success(`Đã tạo danh mục “${name}” thành công.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Không thể lưu danh mục.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const handleDelete = async (category: CategoryEntity) => {
    if (!window.confirm(`Xóa danh mục “${category.name}”? Các bài viết thuộc danh mục này sẽ không bị xóa.`)) return;
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      const msg = `Đã xóa danh mục “${category.name}”.`;
      setFeedback({ type: 'success', message: msg });
      toast.success(msg);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa danh mục.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const [viewMode, setViewMode] = useState<'DOMAIN' | 'TABLE'>('TABLE');

  return (
    <div className="space-y-6">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FolderTree className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Quản lý danh mục nội dung
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Thêm, chỉnh sửa và quản lý danh mục cho chuỗi bài viết và cộng đồng
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="text-xs font-mono gap-1.5 h-9 self-start sm:self-auto"
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

      {/* Summary & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminSearchInput
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          isLoading={isLoading}
          placeholder="Tìm theo tên hoặc slug danh mục..."
          aria-label="Tìm kiếm danh mục"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filteredCategories.length} danh mục
            </span>
            <span>•</span>
            <span>{scopeFilter === 'ALL' ? 'Tất cả phạm vi' : scopeFilter}</span>
          </div>

          {!learningOnly && (
            <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg text-xs font-mono">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'COMMUNITY', label: 'Cộng đồng' },
                { key: 'SERIES', label: 'Chuỗi bài' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setScopeFilter(tab.key as any);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    scopeFilter === tab.key
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                viewMode === 'TABLE'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              Bảng dữ liệu
            </button>
            <button
              type="button"
              onClick={() => setViewMode('DOMAIN')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                viewMode === 'DOMAIN'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              Theo Lĩnh vực
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="h-8 text-xs self-start sm:self-auto"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-border bg-surface/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="p-8 text-center rounded-xl border border-danger/20 bg-danger/5 space-y-3"
        >
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <p className="text-sm font-medium text-foreground">
            Không thể tải danh sách danh mục.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-surface space-y-2">
          <FolderTree className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Chưa có danh mục</h3>
          <p className="text-xs text-muted-foreground">
            Bắt đầu bằng cách tạo danh mục nội dung đầu tiên.
          </p>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && viewMode === 'DOMAIN' && (
        <div className="space-y-3">
          {domains.map((domain) => {
            const domainCategories = filteredCategories.filter((category) => category.domainId === domain.id);
            if (!domainCategories.length) return null;
            const expanded = expandedDomains[domain.id] ?? true;
            return (
              <div key={domain.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
                <button
                  type="button"
                  onClick={() => setExpandedDomains((current) => ({ ...current, [domain.id]: !expanded }))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/40 font-mono text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground font-sans">
                      {domainLabels[domain.code] || domain.nameVi || domain.name}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {domainCategories.length} danh mục
                    </Badge>
                  </span>
                  <span className="text-lg text-muted-foreground font-bold">{expanded ? '−' : '+'}</span>
                </button>
                {expanded && (
                  <div className="grid gap-2 border-t border-border bg-background/30 p-3 sm:grid-cols-2">
                    {domainCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{category.name}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">{category.slug}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(category)} className="h-7 px-2 text-xs">
                            Sửa
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => void handleDelete(category)} className="h-7 px-2 text-xs text-danger">
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && viewMode === 'TABLE' && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-mono text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Đường dẫn (Slug)</th>
                  <th className="py-3 px-4">Lĩnh vực</th>
                  <th className="py-3 px-4">Phạm vi</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleCategories.map((cat) => {
                  const domainObj = domains.find((d) => d.id === cat.domainId);
                  const domainLabel = domainObj ? (domainLabels[domainObj.code] || domainObj.nameVi || domainObj.name) : '—';

                  return (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div>
                          <span className="font-semibold text-sm text-foreground">{cat.name}</span>
                          {cat.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-sm">{cat.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-xs font-sans">
                          {domainLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={cat.scope === 'SERIES' ? 'default' : 'secondary'} className="font-mono text-xs">
                          {cat.scope}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            className="h-8 px-2.5 gap-1 font-mono text-xs"
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
                            className="h-8 px-2.5 gap-1 font-mono text-xs text-danger hover:bg-danger/10"
                            title="Xóa danh mục"
                            aria-label={`Xóa danh mục ${cat.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Xóa</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
