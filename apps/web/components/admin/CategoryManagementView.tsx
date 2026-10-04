'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { postsService } from '@/lib/posts/posts-service';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/admin/use-admin';
import type { CategoryEntity } from '@/types/content';
import { Button } from '@/components/ui/Button';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  BookOpen,
  MessagesSquare,
  Search,
  ChevronDown,
  LayoutGrid,
  TableProperties,
  RefreshCw,
  Loader2,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { AdminPagination } from './AdminPagination';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';
import { useToast } from '@/lib/toast/ToastContext';
import { getDomainColorTheme } from '@/lib/utils/domain-colors';
import { DomainFilterDropdown } from './DomainFilterDropdown';

interface CategoryManagementViewProps {
  learningOnly?: boolean;
}

export function CategoryManagementView({ learningOnly = false }: CategoryManagementViewProps) {
  const { toast } = useToast();

  const domainLabels: Record<string, string> = {
    MONEY: 'Tài chính',
    BUSINESS: 'Kinh doanh',
    TECH: 'Công nghệ',
    CAREER: 'Nghề nghiệp & Học tập',
    LIFE: 'Đời sống',
    SPORTS: 'Thể thao',
    GENERAL: 'Khác',
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'SERIES' | 'COMMUNITY'>(
    learningOnly ? 'SERIES' : 'ALL'
  );

  const {
    data: rawCategories = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCategories(learningOnly ? 'SERIES' : activeTab === 'ALL' ? undefined : activeTab);

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
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [scope, setScope] = useState<'SERIES' | 'COMMUNITY'>(learningOnly ? 'SERIES' : 'SERIES');
  const [domainId, setDomainId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'DOMAIN' | 'TABLE'>('DOMAIN');
  const [selectedPreview, setSelectedPreview] = useState<CategoryEntity | null>(null);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Compute metric stats
  const stats = useMemo(() => {
    const total = rawCategories.length;
    const seriesCount = rawCategories.filter((c) => c.scope === 'SERIES').length;
    const communityCount = rawCategories.filter((c) => c.scope === 'COMMUNITY').length;
    const activeDomainsCount = domains.filter((d) => d.isActive).length;

    return [
      {
        label: 'Tổng danh mục',
        value: total,
        icon: FolderTree,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Danh mục Khóa học',
        value: seriesCount,
        icon: BookOpen,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Danh mục Cộng đồng',
        value: communityCount,
        icon: MessagesSquare,
        iconWrap: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      },
      {
        label: 'Lĩnh vực hoạt động',
        value: activeDomainsCount,
        icon: Compass,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
    ];
  }, [rawCategories, domains]);

  // Compute category count per domain for dropdown
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of rawCategories) {
      if (cat.domainId) {
        counts[cat.domainId] = (counts[cat.domainId] || 0) + 1;
      }
    }
    return counts;
  }, [rawCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setScope(learningOnly ? 'SERIES' : 'SERIES');
    setDomainId(domains[0]?.id || '');
    setDescription('');
    setSortOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryEntity) => {
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
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return rawCategories.filter((cat) => {
      const query = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query));

      const matchesDomain =
        selectedDomainFilter === 'ALL' || cat.domainId === selectedDomainFilter;

      return matchesSearch && matchesDomain;
    });
  }, [rawCategories, debouncedSearch, selectedDomainFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const visibleCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);
  const paginationMeta = {
    page: Math.min(page, totalPages),
    limit: pageSize,
    totalItems: filteredCategories.length,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục.');
      return;
    }

    if (!slug.trim()) {
      toast.error('Vui lòng nhập đường dẫn (slug) danh mục.');
      return;
    }

    if (!domainId) {
      toast.error('Vui lòng chọn lĩnh vực cho danh mục.');
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
        toast.success(`Đã tạo danh mục “${name}” thành công.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu danh mục.';
      toast.error(msg);
    }
  };

  const handleDelete = async (category: CategoryEntity) => {
    if (
      !window.confirm(
        `Xóa danh mục “${category.name}”? Các bài viết thuộc danh mục này sẽ không bị xóa.`
      )
    )
      return;
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success(`Đã xóa danh mục “${category.name}”.`);
      if (selectedPreview?.id === category.id) {
        setSelectedPreview(null);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa danh mục.';
      toast.error(msg);
    }
  };

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <div className="categories-surface space-y-6">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý danh mục nội dung
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem, thêm mới và phân loại danh mục cho giáo trình khóa học và thảo luận cộng đồng.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            onClick={openCreateModal}
            className="h-10 gap-2 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo danh mục</span>
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

      {/* 2. Metric Summary Cards (Soft border + Subtle shadow) */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-[8px] ${stat.iconWrap}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Content Container: Tabs + Filter Toolbar + View */}
      <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm relative">
        {/* Navigation Tabs */}
        {!learningOnly && (
          <div className="flex overflow-x-auto border-b border-slate-100 dark:border-border/60 px-5 scrollbar-none rounded-t-[10px]">
            {[
              { label: 'Tất cả', value: 'ALL' as const, count: rawCategories.length },
              {
                label: 'Khóa học',
                value: 'SERIES' as const,
                count: rawCategories.filter((c) => c.scope === 'SERIES').length,
              },
              {
                label: 'Cộng đồng',
                value: 'COMMUNITY' as const,
                count: rawCategories.filter((c) => c.scope === 'COMMUNITY').length,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                  className={`relative shrink-0 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
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
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3.5 p-4 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Search Input (Expanded Width & Height) */}
          <div className="relative flex-1 sm:max-w-lg lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm danh mục theo tên, slug hoặc mô tả..."
              className="h-11 w-full rounded-[8px] border border-slate-200/80 dark:border-border bg-white dark:bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Domain Filter Dropdown with Distinct Colors */}
            <DomainFilterDropdown
              domains={domains}
              selectedDomainId={selectedDomainFilter}
              onSelect={(val) => {
                setSelectedDomainFilter(val);
                setPage(1);
              }}
              domainCounts={domainCounts}
              totalCount={rawCategories.length}
            />

            {/* View Mode Toggle */}
            <div className="flex h-11 items-center rounded-[8px] border border-slate-200/80 dark:border-border bg-white dark:bg-card p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('DOMAIN')}
                className={`flex h-full items-center gap-2 rounded-[6px] px-3.5 text-xs font-semibold transition-all ${
                  viewMode === 'DOMAIN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Theo Lĩnh vực</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`flex h-full items-center gap-2 rounded-[6px] px-3.5 text-xs font-semibold transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TableProperties className="h-4 w-4" />
                <span>Bảng dữ liệu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-md border border-slate-100 bg-slate-50/50 dark:border-border/60 dark:bg-card/50 p-5 animate-pulse space-y-3"
              >
                <div className="h-5 w-48 rounded-lg bg-slate-200/70 dark:bg-muted" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 rounded bg-slate-200/50 dark:bg-muted/60" />
                  <div className="h-16 rounded bg-slate-200/50 dark:bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div
            role="alert"
            className="m-6 p-8 text-center rounded-md border border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-3"
          >
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Không thể tải danh sách danh mục.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded">
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredCategories.length === 0 && (
          <div className="p-16 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-slate-100 dark:bg-muted text-muted-foreground">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">Không tìm thấy danh mục</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search ? 'Thử tìm với từ khóa khác hoặc điều chỉnh lại bộ lọc lĩnh vực.' : 'Chưa có danh mục nào được khởi tạo trong hệ thống.'}
            </p>
            <Button
              onClick={openCreateModal}
              className="mt-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Tạo danh mục mới
            </Button>
          </div>
        )}

        {/* VIEW MODE 1: THEO LĨNH VỰC (DOMAIN ACCORDIONS WITH MODERN CARDS) */}
        {!isLoading && !isError && filteredCategories.length > 0 && viewMode === 'DOMAIN' && (
          <div className="p-5 space-y-4">
            {domains.map((domain, index) => {
              const domainCategories = filteredCategories.filter(
                (category) =>
                  category.domainId === domain.id || (!category.domainId && index === 0)
              );
              if (!domainCategories.length) return null;
              const expanded = expandedDomains[domain.id] ?? true;
              const colors = getDomainColorTheme(domain, domains);

              return (
                <div
                  key={domain.id}
                  className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Domain Header Accordion Bar */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDomains((current) => ({ ...current, [domain.id]: !expanded }))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50/70 dark:hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border ${colors.border} ${colors.bg} ${colors.text} font-bold text-xs tracking-wider shadow-2xs`}>
                        {domain.code.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-base font-bold text-foreground">
                            {domainLabels[domain.code] || domain.nameVi || domain.name}
                          </h3>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colors.border} ${colors.bg} ${colors.text}`}>
                            {domainCategories.length} danh mục
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                          Mã: {domain.code} • /{domain.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs font-medium hidden sm:inline">
                        {expanded ? 'Thu gọn' : 'Mở rộng'}
                      </span>
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-[8px] border border-slate-200/70 dark:border-border bg-white dark:bg-card text-muted-foreground transition-transform duration-200 shadow-2xs ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </button>

                  {/* Cards Grid inside Domain */}
                  {expanded && (
                    <div className="border-t border-slate-100 dark:border-border/60 bg-slate-50/40 dark:bg-slate-900/20 p-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {domainCategories.map((category) => {
                          const isSeries = category.scope === 'SERIES';
                          return (
                            <div
                              key={category.id}
                              className="group flex flex-col justify-between rounded-[10px] border border-slate-100 dark:border-border/70 bg-white dark:bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-700/60"
                            >
                              <div>
                                {/* Top Badge & Scope */}
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border ${
                                      isSeries
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                        : 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                                    }`}
                                  >
                                    {isSeries ? (
                                      <>
                                        <BookOpen className="h-3 w-3" /> Khóa học
                                      </>
                                    ) : (
                                      <>
                                        <MessagesSquare className="h-3 w-3" /> Cộng đồng
                                      </>
                                    )}
                                  </span>
                                </div>

                                {/* Category Title */}
                                <h4 className="mt-3 font-heading text-base font-bold text-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                  {category.name}
                                </h4>

                                {/* Slug */}
                                <p className="mt-1 font-mono text-xs text-muted-foreground/80 truncate">
                                  /{category.slug}
                                </p>

                                {/* Description */}
                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {category.description || 'Chuyên đề kiến thức và nội dung được tuyển chọn.'}
                                </p>
                              </div>

                              {/* Bottom Action Buttons */}
                              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-border/60 pt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(category)}
                                  className="h-8 gap-1.5 rounded-[6px] border-slate-200/80 dark:border-border px-3 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Sửa</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void handleDelete(category)}
                                  className="h-8 gap-1.5 rounded-[6px] border-rose-200/70 dark:border-rose-900/60 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Xóa</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW MODE 2: BẢNG DỮ LIỆU (DATA TABLE) */}
        {!isLoading && !isError && filteredCategories.length > 0 && viewMode === 'TABLE' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3.5 px-5">Danh mục</th>
                    <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                    <th className="py-3.5 px-4">Lĩnh vực</th>
                    <th className="py-3.5 px-4 text-center">Phạm vi</th>
                    <th className="py-3.5 px-4 text-center">Thứ tự</th>
                    <th className="py-3.5 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border/60">
                  {visibleCategories.map((cat) => {
                    const domainObj = domains.find((d) => d.id === cat.domainId);
                    const domainLabel = domainObj
                      ? domainLabels[domainObj.code] || domainObj.nameVi || domainObj.name
                      : '—';
                    const domainColor = getDomainColorTheme(domainObj, domains);
                    const isSeries = cat.scope === 'SERIES';

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-5 min-w-[220px]">
                          <div>
                            <span className="font-heading font-bold text-sm text-foreground">{cat.name}</span>
                            {cat.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-sm mt-0.5">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-muted-foreground">
                          /{cat.slug}
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${domainColor.border} ${domainColor.bg} ${domainColor.text} shadow-2xs`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${domainColor.dot}`} />
                            {domainLabel}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              isSeries
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                : 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                            }`}
                          >
                            {isSeries ? 'Khóa học' : 'Cộng đồng'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center font-mono text-muted-foreground">
                          {cat.sortOrder ?? 0}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(cat)}
                              className="rounded p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-muted transition-colors"
                              title="Sửa danh mục"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(cat)}
                              className="rounded p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                              title="Xóa danh mục"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-border/60">
              <AdminPagination
                meta={paginationMeta}
                itemLabel="danh mục"
                pageLabel="Trang"
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal: Thêm / Sửa Danh mục */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[10px] border border-slate-100 dark:border-border bg-white dark:bg-card p-7 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Thiết lập thông tin và phạm vi phân bổ danh mục.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-[6px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="category-name-input" className="block text-xs font-semibold text-foreground">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  id="category-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Chứng khoán, Phân tích kỹ thuật, Tài chính cá nhân..."
                  className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Đường dẫn (Slug tự động):</span>
                  <code className="rounded bg-slate-100 dark:bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    /{slug || '...'}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category-domain-select" className="block text-xs font-semibold text-foreground">
                    Trực thuộc Lĩnh vực <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="category-domain-select"
                    value={domainId}
                    onChange={(e) => setDomainId(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  >
                    <option value="">Chọn lĩnh vực...</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domainLabels[domain.code] || domain.nameVi || domain.name}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const modalDomain = domains.find((d) => d.id === domainId);
                    if (!modalDomain) return null;
                    const modalTheme = getDomainColorTheme(modalDomain, domains);
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Nhận diện:</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${modalTheme.border} ${modalTheme.bg} ${modalTheme.text}`}>
                          <span className={`h-2 w-2 rounded-full ${modalTheme.dot}`} />
                          {modalDomain.nameVi || modalDomain.name}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    placeholder="10, 20, 30..."
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Số nhỏ hơn ưu tiên hiển thị trước</p>
                </div>
              </div>

              {!editingCategory && !learningOnly && (
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Phạm vi sử dụng
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScope('SERIES')}
                      className={`flex items-center justify-center gap-2 rounded-[8px] border p-3.5 text-sm font-semibold transition-all ${
                        scope === 'SERIES'
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-2xs dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-border bg-background text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Khóa học (Giáo trình)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScope('COMMUNITY')}
                      className={`flex items-center justify-center gap-2 rounded-[8px] border p-3.5 text-sm font-semibold transition-all ${
                        scope === 'COMMUNITY'
                          ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-2xs dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-border bg-background text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted'
                      }`}
                    >
                      <MessagesSquare className="h-4 w-4" />
                      <span>Cộng đồng (Thảo luận)</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi kiến thức mà danh mục này bao quát..."
                  className="mt-1 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background p-3.5 text-sm text-foreground min-h-[96px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-y"
                />
              </div>



              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
