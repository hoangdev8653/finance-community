'use client';

import React, { useMemo, useState } from 'react';
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
import { CourseSelector } from './CourseSelector';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { Globe, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useUploadMedia } from '@/lib/media/use-media';
import { usePostDraft, PostDraft } from '@/lib/posts/use-post-draft';
import { useToast } from '@/lib/toast/ToastContext';

interface PostStudioProps {
  initialPost?: PostEntity;
  initialLearningPlacement?: { seriesId?: string; lessonOrder: number };
  defaultContentType?: 'SERIES' | 'COMMUNITY';
  allowLearningAuthoring?: boolean;
}

interface ImagePlanItem { key: string; type: 'cover' | 'content'; sectionTitle?: string | null; placement: string; aspectRatio: string; prompt: string; reason: string; }
interface ImagePlan { recommendedImageCount: number; reason: string; items: ImagePlanItem[]; }

export function PostStudio({ initialPost, initialLearningPlacement, defaultContentType = 'SERIES', allowLearningAuthoring = true }: PostStudioProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageLearning = allowLearningAuthoring && (user?.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)) ?? false);
  const categoryMap = useCategoryMap();

  const isEditing = Boolean(initialPost);
  const [currentPostStatus, setCurrentPostStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN'>(initialPost?.status || 'DRAFT');
  const [contentType, setContentType] = useState<'SERIES' | 'COMMUNITY'>(
    initialPost?.contentType || (canManageLearning ? defaultContentType : 'COMMUNITY')
  );
  const effectiveContentType = allowLearningAuthoring ? contentType : 'COMMUNITY';
  const [title, setTitle] = useState(initialPost?.title || '');
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialPost?.categoryId || undefined
  );
  const [domainId, setDomainId] = useState<string | undefined>(initialPost?.domainId || undefined);
  const [seriesId, setSeriesId] = useState<string | undefined>(initialLearningPlacement?.seriesId);
  const [lessonOrder, setLessonOrder] = useState(initialLearningPlacement?.lessonOrder ?? 1);
  const [savedLearningPlacement, setSavedLearningPlacement] = useState(initialLearningPlacement ?? { lessonOrder: 1 });
  const [tags, setTags] = useState<string[]>(initialPost?.tags?.map((tag) => tag.slug) || []);
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
  const [researchedSources, setResearchedSources] = useState<Array<{ title: string; url: string }>>([]);

  const draftValue = useMemo<PostDraft>(() => ({
    title, contentType: !isEditing && !canManageLearning ? 'COMMUNITY' : contentType, categoryId, domainId, seriesId, lessonOrder, tags,
    coverMediaId, body, metaTitle, metaDescription,
  }), [title, contentType, isEditing, canManageLearning, categoryId, domainId, seriesId, lessonOrder, tags, coverMediaId, body, metaTitle, metaDescription]);
  const draftKey = `finance-community:post-draft:${user?.id || 'anonymous'}:${initialPost?.id || 'new'}`;
  const { restoredDraft, clearDraft } = usePostDraft(draftKey, draftValue, !isEditing, {
    clearOnMount: !isEditing && allowLearningAuthoring && defaultContentType === 'SERIES',
    clearOnUnmount: !isEditing && allowLearningAuthoring && defaultContentType === 'SERIES',
  });

  React.useEffect(() => {
    if (!restoredDraft) return;
    setTitle(restoredDraft.title);
    setContentType(isEditing || canManageLearning ? restoredDraft.contentType : 'COMMUNITY');
    setCategoryId(restoredDraft.categoryId);
    setDomainId(restoredDraft.domainId);
    setSeriesId(restoredDraft.seriesId);
    setLessonOrder(restoredDraft.lessonOrder);
    setTags(restoredDraft.tags);
    setCoverMediaId(restoredDraft.coverMediaId);
    setBody(restoredDraft.body);
    setMetaTitle(restoredDraft.metaTitle);
    setMetaDescription(restoredDraft.metaDescription);
  }, [restoredDraft, isEditing, canManageLearning]);

  const generateDraft = async () => {
    if (!canManageLearning) return;
    if (!title.trim() || !domainId || (effectiveContentType === 'COMMUNITY' && !categoryId)) {
      setError('Vui lòng nhập tiêu đề, lĩnh vực và chủ đề trước khi tạo bản nháp.');
      return;
    }
    setIsGeneratingDraft(true);
    setError(null);
    try {
      const { data } = await apiClient.post<{
        body: string;
        imagePlan: ImagePlan;
        sources?: Array<{ title: string; url: string }>;
        metaTitle?: string;
        metaDescription?: string;
      }>('/ai-editorial/draft', {
        title: title.trim(),
        domain: domainId,
        category: categoryId || undefined,
        series: seriesId,
        lessonOrder,
      });
      setBody(data.body);
      setImagePlan(data.imagePlan);
      if (data.sources && data.sources.length > 0) {
        setResearchedSources(data.sources);
      }
      if (data.metaTitle && !metaTitle) {
        setMetaTitle(data.metaTitle);
      }
      if (data.metaDescription && !metaDescription) {
        setMetaDescription(data.metaDescription);
      }
    } catch {
      setError('Không thể tạo bản nháp AI. Vui lòng kiểm tra cấu hình AI hoặc thử lại.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài học.');
      return false;
    }
    if (!domainId) { setError('Vui lòng chọn lĩnh vực học tập.'); return false; }
    if (effectiveContentType === 'COMMUNITY' && !categoryId) { setError('Vui lòng chọn chủ đề học tập.'); return false; }
    if (title.length > 300) {
      setError('Tiêu đề không được vượt quá 300 ký tự.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN') => {
    if (!validate()) return;
    if (status === 'PUBLISHED' && effectiveContentType === 'SERIES' && !coverMediaId && !pendingCoverFile) {
      setError('Vui lòng thêm ảnh bìa bài học trước khi gửi xuất bản.');
      return;
    }

    if (status !== 'PUBLISHED') {
      setIsSavingDraft(true);
    } else {
      setIsPublishing(true);
    }

    try {
      const releasePendingContentImages = () => {
        pendingContentImages.forEach((_file, temporaryUrl) => URL.revokeObjectURL(temporaryUrl));
        setPendingContentImages(new Map());
      };
      let finalCoverMediaId = coverMediaId || undefined;
      if (pendingCoverFile) {
        const coverMedia = await uploadContentMedia({ file: pendingCoverFile, purpose: 'cover', folder: 'posts/covers' });
        finalCoverMediaId = coverMedia.id;
      }
      let finalBody = body.trim() || undefined;
      if (pendingContentImages.size > 0 && finalBody) {
        for (const [temporaryUrl, file] of pendingContentImages) {
          if (!finalBody.includes(temporaryUrl)) continue;
          const media = await uploadContentMedia({ file, purpose: 'content', folder: 'posts/content' });
          finalBody = finalBody.split(temporaryUrl).join(media.secureUrl);
        }
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
          categoryId: effectiveContentType === 'COMMUNITY' ? categoryId || undefined : undefined,
          domainId: domainId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: finalCoverMediaId,
          status,
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        });
        setCurrentPostStatus(status);
        if (canManageLearning && effectiveContentType === 'SERIES') {
          await saveLearningPlacement(initialPost.id);
        }
        setBody(finalBody || '');
        releasePendingContentImages();

        if (updated.contentType === 'SERIES') {
          toast.success(status === 'PUBLISHED' ? 'Bài học đã được xuất bản.' : 'Đã lưu bản nháp bài học.');
        } else if (status === 'PUBLISHED') {
          router.push(
            updated.contentType === 'SERIES'
              ? `/bai-viet/khoa-hoc/${updated.slug}`
              : `/bai-viet/cong-dong/${updated.slug}`
          );
        } else {
          router.push('/');
        }
      } else {
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          contentType: canManageLearning ? contentType : 'COMMUNITY',
          body: finalBody,
          categoryId: effectiveContentType === 'COMMUNITY' ? categoryId || undefined : undefined,
          domainId: domainId || undefined,
          tags: tags.length > 0 ? tags : undefined,
          coverMediaId: finalCoverMediaId,
          status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
        });

        if (canManageLearning && seriesId) await learningCourseService.addLesson(seriesId, created.id, lessonOrder);
        releasePendingContentImages();

        if (created.contentType === 'SERIES') {
          clearDraft();
          setTitle('');
          setBody('');
          setTags([]);
          setCoverMediaId(null);
          setPendingCoverFile(null);
          setPendingContentImages(new Map());
          setMetaTitle('');
          setMetaDescription('');
          setImagePlan(undefined);
          setResearchedSources([]);
          if (seriesId) setLessonOrder((current) => current + 1);
          toast.success(status === 'PUBLISHED' ? 'Bài học đã được xuất bản.' : 'Đã lưu bản nháp bài học.');
        } else if (status === 'PUBLISHED') {
          router.push(
            created.contentType === 'SERIES'
              ? `/bai-viet/khoa-hoc/${created.slug}`
              : `/bai-viet/cong-dong/${created.slug}`
          );
        } else {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const apiMessage = Array.isArray(responseData?.message)
        ? responseData.message.join(' ')
        : responseData?.message;
      const normalizedMessage = (err as { message?: string })?.message;
      setError(apiMessage || normalizedMessage || (err instanceof Error ? err.message : null) || 'Không thể lưu bài viết. Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setIsSavingDraft(false);
      setIsPublishing(false);
    }
  };

  const saveLearningPlacement = async (postId: string) => {
    const previousSeriesId = savedLearningPlacement.seriesId;
    if (seriesId === previousSeriesId) {
      if (seriesId && lessonOrder !== savedLearningPlacement.lessonOrder) {
        await learningCourseService.reorderLesson(seriesId, postId, lessonOrder);
      }
      setSavedLearningPlacement({ seriesId, lessonOrder });
      return;
    }

    if (seriesId) {
      const targetPath = await learningCourseService.getAdminPath(seriesId);
      const alreadyAdded = targetPath.lessons.some((lesson) => lesson.id === postId);
      if (!alreadyAdded) {
        const appendOrder = Math.max(0, ...targetPath.lessons.map((lesson) => lesson.lessonOrder)) + 1;
        await learningCourseService.addLesson(seriesId, postId, appendOrder);
      }
      if (!alreadyAdded || lessonOrder !== savedLearningPlacement.lessonOrder) {
        await learningCourseService.reorderLesson(seriesId, postId, lessonOrder);
      }
    }

    if (previousSeriesId) await learningCourseService.removeLesson(previousSeriesId, postId);
    setSavedLearningPlacement({ seriesId, lessonOrder });
  };

  const categoryName = categoryId ? categoryMap[categoryId]?.name : undefined;

  return (
    <div className="learning-editor mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Top Action Bar */}
      <StudioHeader
        isEditing={isEditing}
        isCommunityOnly={!allowLearningAuthoring}
        isAdminStudio={allowLearningAuthoring && canManageLearning && effectiveContentType === 'SERIES'}
        backHref={allowLearningAuthoring ? '/quan-tri/hoc-tap' : '/'}
        isPreview={isPreview}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
        onTogglePreview={() => setIsPreview((prev) => !prev)}
        onSaveDraft={() => handleSave('DRAFT')}
        primaryActionLabel={isEditing ? (currentPostStatus === 'DRAFT' ? 'Lưu thay đổi' : 'Cập nhật bài viết') : 'Gửi xuất bản'}
        onPublish={() => handleSave(isEditing ? currentPostStatus : 'PUBLISHED')}
      />
      {/* Validation Error Feedback */}
      {error && (
        <div className="rounded-md bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium animate-in fade-in">
          {error}
        </div>
      )}
      {/* Researched Sources Feedback */}
      {researchedSources.length > 0 && (
        <div className="rounded-[10px] border border-teal-200 bg-teal-50/70 dark:border-teal-900/60 dark:bg-teal-950/20 p-4 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold text-teal-900 dark:text-teal-200">
            <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>AI đã tự động tìm kiếm và đối chiếu {researchedSources.length} nguồn uy tín trên Google:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {researchedSources.map((source, idx) => (
              <li key={idx} className="truncate">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 dark:text-teal-300 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{source.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workspace */}
      {isPreview ? (
        <PostPreview
          title={title}
          contentType={effectiveContentType}
          categoryName={categoryName}
          tags={tags}
          body={body}
          authorName={user?.email?.split('@')[0] || 'Tác giả'}
        />
      ) : (
        <PostEditor
          title={title}
          contentType={effectiveContentType}
          categoryId={categoryId}
          domainId={domainId}
          seriesId={seriesId}
          lessonOrder={lessonOrder}
          tags={tags}
          coverMediaId={coverMediaId}
          body={body}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          isAdmin={canManageLearning}
          communityOnly={!allowLearningAuthoring}
          onTitleChange={setTitle}
          onContentTypeChange={setContentType}
          onCategoryChange={setCategoryId}
          onDomainChange={(value) => { setDomainId(value); setCategoryId(undefined); }}
          onSeriesChange={(value) => setSeriesId(value || undefined)}
          onLessonOrderChange={setLessonOrder}
          onTagsChange={setTags}
          onCoverMediaChange={setCoverMediaId}
          onPendingCoverFileChange={setPendingCoverFile}
          imagePlan={imagePlan}
          onBodyChange={setBody}
          onPendingImagesChange={setPendingContentImages}
          onGenerateDraft={canManageLearning ? generateDraft : undefined}
          isGeneratingDraft={isGeneratingDraft}
          onMetaTitleChange={setMetaTitle}
          onMetaDescriptionChange={setMetaDescription}
        />
      )}

      {isEditing && initialPost?.contentType === 'SERIES' && (
        <div className="space-y-5 border-t border-border/60 pt-6 font-sans">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Công cụ bổ trợ bài học</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý nguồn tham khảo, câu hỏi ôn tập và lịch sử biên tập.
            </p>
          </div>
          <LearningSourceManager postId={initialPost.id} />
          <LearningQuizManager postId={initialPost.id} />
          {user?.roles?.some((role) => ['ADMIN', 'SUPER_ADMIN'].includes(role)) && (
            <LearningAuditHistory postId={initialPost.id} />
          )}
        </div>
      )}
    </div>
  );
}
