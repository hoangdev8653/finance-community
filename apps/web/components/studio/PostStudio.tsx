'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostEntity } from '@/types/content';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCategoryMap } from '@/lib/posts/use-posts-feed';
import { useCreatePost, useUpdatePost } from '@/lib/posts/use-post-mutations';
import { StudioHeader } from './StudioHeader';
import { PostEditor } from './PostEditor';
import { PostPreview } from './PostPreview';

interface PostStudioProps {
  initialPost?: PostEntity;
}

export function PostStudio({ initialPost }: PostStudioProps) {
  const router = useRouter();
  const { user } = useAuth();
  const categoryMap = useCategoryMap();

  const isEditing = Boolean(initialPost);

  // Form State
  const [title, setTitle] = useState(initialPost?.title || '');
  const [contentType, setContentType] = useState<'SERIES' | 'COMMUNITY' | 'NEWS'>(
    initialPost?.contentType || 'COMMUNITY'
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialPost?.categoryId || undefined
  );
  const [tags, setTags] = useState<string[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(
    initialPost?.coverMediaId || null
  );
  const [body, setBody] = useState(initialPost?.body || '');
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.metaDescription || ''
  );

  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost(initialPost?.id || '');

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const validate = (): boolean => {
    if (!title.trim()) {
      setError('Analysis title is required.');
      return false;
    }
    if (title.length > 300) {
      setError('Title cannot exceed 300 characters.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!validate()) return;

    if (status === 'DRAFT') {
      setIsSavingDraft(true);
    } else {
      setIsPublishing(true);
    }

    try {
      if (isEditing && initialPost) {
        const updated = await updateMutation.mutateAsync({
          title: title.trim(),
          body: body.trim() || undefined,
          categoryId: categoryId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: coverMediaId || undefined,
          status,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        });

        if (status === 'PUBLISHED') {
          router.push(`/posts/${updated.contentType}/${updated.slug}`);
        } else {
          router.push('/');
        }
      } else {
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          contentType,
          body: body.trim() || undefined,
          categoryId: categoryId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: coverMediaId || undefined,
          status,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        });

        if (status === 'PUBLISHED') {
          router.push(`/posts/${created.contentType}/${created.slug}`);
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('Failed to save analysis. Please verify your inputs and try again.');
    } finally {
      setIsSavingDraft(false);
      setIsPublishing(false);
    }
  };

  const categoryName = categoryId ? categoryMap[categoryId]?.name : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      {/* Studio Top Action Bar */}
      <StudioHeader
        isEditing={isEditing}
        isPreview={isPreview}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
        onTogglePreview={() => setIsPreview((prev) => !prev)}
        onSaveDraft={() => handleSave('DRAFT')}
        onPublish={() => handleSave('PUBLISHED')}
      />

      {/* Validation Error Feedback */}
      {error && (
        <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* Workspace */}
      {isPreview ? (
        <PostPreview
          title={title}
          contentType={contentType}
          categoryName={categoryName}
          tags={tags}
          body={body}
          authorName={user?.email?.split('@')[0] || 'Current Analyst'}
        />
      ) : (
        <PostEditor
          title={title}
          contentType={contentType}
          categoryId={categoryId}
          tags={tags}
          coverMediaId={coverMediaId}
          body={body}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          isAdmin={user?.roles?.includes('ADMIN')}
          onTitleChange={setTitle}
          onContentTypeChange={setContentType}
          onCategoryChange={setCategoryId}
          onTagsChange={setTags}
          onCoverMediaChange={setCoverMediaId}
          onBodyChange={setBody}
          onMetaTitleChange={setMetaTitle}
          onMetaDescriptionChange={setMetaDescription}
        />
      )}
    </div>
  );
}
