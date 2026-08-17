'use client';

import React, { useState } from 'react';
import { useCategories } from '@/lib/posts/use-posts-feed';
import { useCreateCategory, useUpdateCategory } from '@/lib/admin/use-admin';
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
} from 'lucide-react';

export function CategoryManagementView() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEntity | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [scope, setScope] = useState<'SERIES' | 'COMMUNITY'>('COMMUNITY');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const openCreateModal = () => {
    setFeedback(null);
    setEditingCategory(null);
    setName('');
    setSlug('');
    setScope('COMMUNITY');
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

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          dto: {
            name: name.trim(),
            slug: slug.trim(),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">
            Content Category Management
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Define taxonomic categories for curriculum series and community discussions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="text-xs font-mono gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
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
            Failed to load categories.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length === 0 && (
        <div className="p-12 text-center rounded-lg border border-dashed border-border bg-surface space-y-2">
          <FolderTree className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Categories Defined</h3>
          <p className="text-xs text-muted-foreground">
            Get started by creating your first content category.
          </p>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">
                      {cat.name}
                    </span>
                    <Badge variant="outline" className="text-2xs font-mono">
                      {cat.slug}
                    </Badge>
                    <Badge
                      variant={cat.scope === 'SERIES' ? 'default' : 'secondary'}
                      className="text-3xs font-mono"
                    >
                      {cat.scope}
                    </Badge>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(cat)}
                    className="text-xs h-7 px-2.5 gap-1 font-mono"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
                <h3 id="category-modal-title" className="font-serif text-base font-bold text-foreground">
                  {editingCategory ? 'Edit Content Category' : 'Create Content Category'}
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
                  Category Name <span className="text-danger">*</span>
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

              {!editingCategory && (
                <div className="space-y-1">
                  <label htmlFor="cat-scope" className="text-xs font-semibold text-foreground">
                    Content Scope
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
                <label htmlFor="cat-desc" className="text-xs font-semibold text-foreground">
                  Description
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
                  Sort Order
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
                  Cancel
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
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
