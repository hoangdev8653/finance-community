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
import { LearningSourceManager } from '@/components/learning/LearningSourceManager';
import { LearningQuizManager } from '@/components/learning/LearningQuizManager';
import { learningService } from '@/lib/learning/learning-service';
import { LearningAuditHistory } from '@/components/learning/LearningAuditHistory';
import { SeriesSelector } from './SeriesSelector';
import { learningSeriesService } from '@/lib/learning/learning-series-service';
import { apiClient } from '@/lib/api/client';
import { useUploadMedia } from '@/lib/media/use-media';

interface PostStudioProps {
  initialPost?: PostEntity;
  defaultContentType?: 'SERIES' | 'COMMUNITY';
}

interface ImagePlanItem { key: string; type: 'cover' | 'content'; sectionTitle?: string | null; placement: string; aspectRatio: string; prompt: string; reason: string; }
interface ImagePlan { recommendedImageCount: number; reason: string; items: ImagePlanItem[]; }

export function PostStudio({ initialPost, defaultContentType = 'SERIES' }: PostStudioProps) {
  const router = useRouter();
  const { user } = useAuth();
  const categoryMap = useCategoryMap();

  const isEditing = Boolean(initialPost);

  // Form State
  const [title, setTitle] = useState(initialPost?.title || '');
  const [contentType, setContentType] = useState<'SERIES' | 'COMMUNITY'>(
    initialPost?.contentType || defaultContentType
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialPost?.categoryId || undefined
  );
  const [domainId, setDomainId] = useState<string | undefined>(initialPost?.domainId || undefined);
  const [seriesId, setSeriesId] = useState<string>();
  const [lessonOrder, setLessonOrder] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(
    initialPost?.coverMediaId || null
  );
  const [body, setBody] = useState(initialPost?.body || '');
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.metaDescription || ''
  );
  const [pendingContentImages, setPendingContentImages] = useState<Map<string, File>>(new Map());
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const { mutateAsync: uploadContentMedia } = useUploadMedia();

  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost(initialPost?.id || '');

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [imagePlan, setImagePlan] = useState<ImagePlan | undefined>();
  const generateDraft = async () => {
    if (!title.trim() || !domainId || !categoryId) { setError('Vui lòng nhập tiêu đề, lĩnh vực và chủ đề trước khi tạo bản nháp.'); return; }
    setIsGeneratingDraft(true); setError(null);
    try { const { data } = await apiClient.post<{ body: string; imagePlan: ImagePlan }>('/ai-editorial/draft', { title: title.trim(), domain: domainId, category: categoryId, series: seriesId, lessonOrder }); setBody(data.body); setImagePlan(data.imagePlan); }
    catch { setError('Không thể tạo bản nháp AI. Vui lòng kiểm tra cấu hình AI hoặc thử lại.'); }
    finally { setIsGeneratingDraft(false); }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài học.');
      return false;
    }
    if (!domainId) { setError('Vui lòng chọn lĩnh vực học tập.'); return false; }
    if (!categoryId) { setError('Vui lòng chọn chủ đề học tập.'); return false; }
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
      let finalCoverMediaId = coverMediaId || undefined;
      if (pendingCoverFile) {
        const coverMedia = await uploadContentMedia({ file: pendingCoverFile, purpose: 'cover', folder: 'posts/covers' });
        finalCoverMediaId = coverMedia.id;
      }
      let finalBody = body.trim() || undefined;
      if (pendingContentImages.size > 0 && finalBody) {
        for (const [temporaryUrl, file] of pendingContentImages) {
          const media = await uploadContentMedia({ file, purpose: 'content', folder: 'posts/content' });
          finalBody = finalBody.split(temporaryUrl).join(media.secureUrl);
          URL.revokeObjectURL(temporaryUrl);
        }
        setPendingContentImages(new Map());
      }
      if (isEditing && initialPost) {
        if (status === 'PUBLISHED' && contentType === 'SERIES' && !user?.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role))) {
          await learningService.submitForReview(initialPost.id);
          router.push('/admin/learning');
          return;
        }
        const updated = await updateMutation.mutateAsync({
          title: title.trim(),
          body: finalBody,
          categoryId: categoryId || undefined,
          domainId: domainId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: finalCoverMediaId,
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
          body: finalBody,
          categoryId: categoryId || undefined,
          domainId: domainId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: finalCoverMediaId,
          status,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        });

        if (seriesId) await learningSeriesService.addLesson(seriesId, created.id, lessonOrder);

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
    <div className="learning-editor mx-auto w-full max-w-none px-0 py-4 space-y-6">
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
      {isEditing && initialPost?.contentType === 'SERIES' && <LearningSourceManager postId={initialPost.id} />}
      {isEditing && initialPost?.contentType === 'SERIES' && <LearningQuizManager postId={initialPost.id} />}
      {isEditing && initialPost?.contentType === 'SERIES' && user?.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)) && <LearningAuditHistory postId={initialPost.id} />}

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
          domainId={domainId}
          seriesId={seriesId}
          lessonOrder={lessonOrder}
          tags={tags}
          coverMediaId={coverMediaId}
          body={body}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          isAdmin={user?.roles?.includes('ADMIN')}
          onTitleChange={setTitle}
          onContentTypeChange={setContentType}
          onCategoryChange={setCategoryId}
          onDomainChange={(value) => { setDomainId(value); setCategoryId(undefined); }}
          onSeriesChange={setSeriesId}
          onLessonOrderChange={setLessonOrder}
          onTagsChange={setTags}
          onCoverMediaChange={setCoverMediaId}
          onPendingCoverFileChange={setPendingCoverFile}
          imagePlan={imagePlan}
          onBodyChange={setBody}
          onPendingImagesChange={setPendingContentImages}
          onGenerateDraft={generateDraft}
          isGeneratingDraft={isGeneratingDraft}
          onMetaTitleChange={setMetaTitle}
          onMetaDescriptionChange={setMetaDescription}
        />
      )}
    </div>
  );
}
