'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  BookOpen,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Globe,
  Layers,
  EyeOff,
} from 'lucide-react';
import { postsService } from '@/lib/posts/posts-service';
import type { DomainEntity } from '@/types/content';
import { Button } from '@/components/ui/Button';
import { AdminSearchInput } from './AdminSearchInput';
import { useToast } from '@/lib/toast/ToastContext';
import { getDomainColorTheme } from '@/lib/utils/domain-colors';

interface DomainFormData {
  name: string;
  code: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isPromoted: boolean;
}

const emptyForm: DomainFormData = {
  name: '',
  code: '',
  slug: '',
  nameVi: '',
  nameEn: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  isPromoted: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function codeify(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'D')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function DomainManagementView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainEntity | null>(null);
  const [form, setForm] = useState<DomainFormData>(emptyForm);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Fetch domains (with inactive domains included for admin)
  const {
    data: domains = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-domains'],
    queryFn: () => postsService.getDomains({ includeInactive: true }),
  });

  // Metric stats
  const stats = useMemo(() => {
    const total = domains.length;
    const activeCount = domains.filter((d) => d.isActive).length;
    const inactiveCount = domains.filter((d) => !d.isActive).length;
    const promotedCount = domains.filter((d) => d.isPromoted).length;

    return [
      {
        label: 'Tổng lĩnh vực',
        value: total,
        icon: Compass,
        iconWrap: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        label: 'Đang hoạt động',
        value: activeCount,
        icon: CheckCircle2,
        iconWrap: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        label: 'Tạm ẩn',
        value: inactiveCount,
        icon: EyeOff,
        iconWrap: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      },
      {
        label: 'Lĩnh vực nổi bật',
        value: promotedCount,
        icon: Sparkles,
        iconWrap: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
    ];
  }, [domains]);

  // Mutation: Create Domain
  const createMutation = useMutation({
    mutationFn: (data: DomainFormData) =>
      postsService.createDomain({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        slug: data.slug.trim().toLowerCase(),
        nameVi: data.nameVi.trim() || undefined,
        nameEn: data.nameEn.trim() || undefined,
        description: data.description.trim() || undefined,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive,
        isPromoted: data.isPromoted,
      }),
    onSuccess: (newDomain) => {
      toast.success(`Đã tạo lĩnh vực “${newDomain.name}” thành công!`);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      closeModal();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Không thể tạo lĩnh vực.';
      toast.error(msg);
    },
  });

  // Mutation: Update Domain
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DomainFormData> }) =>
      postsService.updateDomain(id, data),
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật lĩnh vực “${updated.name}”.`);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      closeModal();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Không thể cập nhật lĩnh vực.';
      toast.error(msg);
    },
  });

  // Mutation: Delete Domain
  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsService.deleteDomain(id),
    onSuccess: (deleted) => {
      toast.success(`Đã xóa lĩnh vực “${deleted.name}”.`);
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Không thể xóa lĩnh vực.';
      toast.error(msg);
    },
  });

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const matchesSearch =
        search === '' ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.slug.toLowerCase().includes(search.toLowerCase()) ||
        (d.nameVi && d.nameVi.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && d.isActive) ||
        (statusFilter === 'INACTIVE' && !d.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [domains, search, statusFilter]);

  const openCreateModal = () => {
    setEditingDomain(null);
    setForm(emptyForm);
    setAutoGenerateSlug(true);
    setIsModalOpen(true);
  };

  const openEditModal = (domain: DomainEntity) => {
    setEditingDomain(domain);
    setForm({
      name: domain.name,
      code: domain.code,
      slug: domain.slug,
      nameVi: domain.nameVi || '',
      nameEn: domain.nameEn || '',
      description: domain.description || '',
      sortOrder: domain.sortOrder || 0,
      isActive: domain.isActive,
      isPromoted: domain.isPromoted,
    });
    setAutoGenerateSlug(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDomain(null);
    setForm(emptyForm);
  };

  const handleNameChange = (val: string) => {
    setForm((prev) => {
      const next = { ...prev, name: val };
      if (autoGenerateSlug && !editingDomain) {
        next.slug = slugify(val);
        next.code = codeify(val);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên lĩnh vực.');
      return;
    }
    if (!form.code.trim()) {
      toast.error('Vui lòng nhập mã code lĩnh vực (VD: MONEY, REAL_ESTATE).');
      return;
    }

    const payload = {
      ...form,
      slug: form.slug.trim() || undefined,
    };

    if (editingDomain) {
      updateMutation.mutate({ id: editingDomain.id, data: payload as any });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const handleToggleStatus = (domain: DomainEntity) => {
    updateMutation.mutate({
      id: domain.id,
      data: { isActive: !domain.isActive },
    });
  };

  const handleDelete = (domain: DomainEntity) => {
    const totalLinked = (domain.categoryCount || 0) + (domain.courseCount || 0);
    if (totalLinked > 0) {
      toast.error(
        `Không thể xóa “${domain.name}” vì có ${domain.categoryCount || 0} danh mục và ${domain.courseCount || 0} khóa học đang trực thuộc.`
      );
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa lĩnh vực “${domain.name}” (${domain.code})?`)) {
      deleteMutation.mutate(domain.id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="domains-surface space-y-6">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Quản lý Lĩnh vực (Domains)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các trục nội dung cao nhất của hệ thống (Tài chính, Bất động sản, Kinh doanh...)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <Button
            onClick={openCreateModal}
            className="h-10 gap-2 rounded-[8px] bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo lĩnh vực</span>
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
                <p className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
                  {stat.value.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Main Content Container: Tabs + Filter Toolbar + Table */}
      <div className="rounded-[10px] border border-slate-100 dark:border-border/80 bg-white dark:bg-card shadow-sm overflow-hidden">
        {/* Status Navigation Tabs (Matching AdminPostsTable) */}
        <div className="flex overflow-x-auto border-b border-border px-4 scrollbar-none">
          {[
            { label: 'Tất cả', value: 'ALL' as const, count: domains.length },
            {
              label: 'Đang hoạt động',
              value: 'ACTIVE' as const,
              count: domains.filter((d) => d.isActive).length,
            },
            {
              label: 'Tạm ẩn',
              value: 'INACTIVE' as const,
              count: domains.filter((d) => !d.isActive).length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`relative shrink-0 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-emerald-600 font-semibold text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>{' '}
                <span className="tabular-nums opacity-90">({tab.count.toLocaleString('vi-VN')})</span>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar (Matching AdminPostsTable) */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminSearchInput
            value={search}
            onValueChange={setSearch}
            fullWidth
            containerClassName="min-w-[220px] flex-1"
            placeholder="Tên lĩnh vực, mã hoặc slug..."
            aria-label="Tìm kiếm lĩnh vực"
          />

          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>Hiển thị {filteredDomains.length} / {domains.length} lĩnh vực</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-border/60 text-slate-700 dark:text-slate-200 font-semibold">
              <tr>
                <th className="py-3.5 px-5">Lĩnh vực</th>
                <th className="py-3.5 px-4">Mã Code</th>
                <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                <th className="py-3.5 px-4 text-center">Trực thuộc</th>
                <th className="py-3.5 px-4 text-center">Thứ tự</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
                    <p className="mt-2 text-xs">Đang tải danh sách lĩnh vực...</p>
                  </td>
                </tr>
              ) : filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <Compass className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="mt-2 font-heading font-bold text-foreground">Không tìm thấy lĩnh vực</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {search ? 'Thử tìm với từ khóa khác' : 'Chưa có lĩnh vực nào trong hệ thống.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => {
                  const domainColor = getDomainColorTheme(domain, domains);
                  return (
                    <tr
                      key={domain.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] font-bold text-xs shadow-2xs border ${domainColor.border} ${domainColor.bg} ${domainColor.text}`}>
                            {domain.code.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-base text-foreground">
                                {domain.name}
                              </span>
                              {domain.isPromoted && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                  <Sparkles className="h-2.5 w-2.5" /> Nổi bật
                                </span>
                              )}
                            </div>
                            {domain.description ? (
                              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                                {domain.description}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                                {domain.nameVi || domain.nameEn || 'Trục nội dung hệ thống'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-4 px-4 font-mono">
                        <span className={`inline-flex items-center rounded-[6px] border px-2.5 py-1 text-sm font-semibold ${domainColor.border} ${domainColor.bg} ${domainColor.text}`}>
                          {domain.code}
                        </span>
                      </td>

                    {/* Slug */}
                    <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      /{domain.slug}
                    </td>

                    {/* Children count */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300"
                          title="Danh mục con"
                        >
                          <FolderTree className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          {domain.categoryCount ?? 0}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">•</span>
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-300"
                          title="Khóa học con"
                        >
                          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          {domain.courseCount ?? 0}
                        </span>
                      </div>
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {domain.sortOrder}
                    </td>

                    {/* Active Switch */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(domain)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border ${
                          domain.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-100'
                        }`}
                      >
                        {domain.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Hoạt động
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" /> Tạm ẩn
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(domain)}
                          className="rounded-[6px] p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-muted transition-colors"
                          title="Sửa lĩnh vực"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(domain)}
                          className="rounded-[6px] p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                          title="Xóa lĩnh vực"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Thêm / Sửa Lĩnh vực */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[10px] border border-slate-100 dark:border-border bg-white dark:bg-card p-7 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    {editingDomain ? 'Chỉnh sửa Lĩnh vực' : 'Thêm Lĩnh vực mới'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý trục chủ đề chính cho toàn bộ nền tảng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-[6px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Tên lĩnh vực <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Bất động sản, Tiền mã hóa, Tài chính..."
                  className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Mã Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="VD: REAL_ESTATE"
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm font-mono uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">Viết hoa, không dấu</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Đường dẫn (Slug) <span className="font-normal text-muted-foreground text-[11px]">(tùy chọn - tự sinh từ tên)</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                    }
                    placeholder="VD: bat-dong-san"
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">kebab-case trên URL</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Tên tiếng Việt mở rộng
                  </label>
                  <input
                    type="text"
                    value={form.nameVi}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameVi: e.target.value }))}
                    placeholder="VD: Bất động sản & Nhà đất"
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Tên tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => setForm((prev) => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="VD: Real Estate"
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả tóm tắt nội dung của lĩnh vực này..."
                  className="mt-1 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background p-3.5 text-sm text-foreground min-h-[96px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-3 gap-3.5 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 dark:border-border bg-background px-4 text-sm font-mono text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is-active" className="text-xs font-medium text-foreground cursor-pointer">
                    Kích hoạt
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is-promoted"
                    checked={form.isPromoted}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPromoted: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is-promoted" className="text-xs font-medium text-foreground cursor-pointer">
                    Nổi bật
                  </label>
                </div>
              </div>

              {/* Color Theme Preview */}
              {(() => {
                const previewTheme = getDomainColorTheme(
                  { code: form.code, slug: form.slug, id: editingDomain?.id },
                  domains
                );
                return (
                  <div className="flex items-center gap-3 rounded-[8px] border border-slate-100 dark:border-border/80 bg-slate-50/70 dark:bg-muted/40 p-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] font-bold text-xs ${previewTheme.border} ${previewTheme.bg} ${previewTheme.text} border shadow-2xs`}>
                      {(form.code || 'LV').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground">Màu sắc nhận diện:</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${previewTheme.dot}`} />
                        <span className={`text-xs font-semibold ${previewTheme.text}`}>
                          {previewTheme.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          (Tự động gán màu riêng biệt, không trùng lặp)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
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
                  <span>{editingDomain ? 'Lưu thay đổi' : 'Tạo lĩnh vực'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
