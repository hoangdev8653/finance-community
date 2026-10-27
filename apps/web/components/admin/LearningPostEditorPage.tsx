'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { PostStudio } from '@/components/studio/PostStudio';
import { learningCourseService } from '@/lib/learning/learning-course-service';
import { postsService } from '@/lib/posts/posts-service';
import type { PostDetailResponse } from '@/types/content';

export function LearningPostEditorPage({ postId }: { postId: string }) {
  return (
    <AuthGuard>
      <LearningPostLoader postId={postId} />
    </AuthGuard>
  );
}

function LearningPostLoader({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [learningPlacement, setLearningPlacement] = useState<{ seriesId?: string; lessonOrder: number }>({ lessonOrder: 1 });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await postsService.getById(postId);
      if (result.contentType !== 'SERIES') {
        setError(true);
        return;
      }
      const courses = await learningCourseService.list();
      const paths = await Promise.all(courses.map((course) => learningCourseService.getAdminPath(course.id)));
      const placement = paths
        .flatMap((path) => path.lessons.map((lesson) => ({ seriesId: path.series.id, lesson })))
        .find(({ lesson }) => lesson.id === result.id);
      setLearningPlacement(placement
        ? { seriesId: placement.seriesId, lessonOrder: placement.lesson.lessonOrder }
        : { lessonOrder: 1 });
      setPost(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  if (loading) return <LoadingState message="Đang tải bài học để chỉnh sửa..." />;
  if (error || !post) {
    return (
      <ErrorState
        title="Không thể tải bài học"
        message="Bài học không tồn tại hoặc tài khoản của bạn không có quyền truy cập. Hãy thử tải lại."
        onRetry={() => void loadPost()}
      />
    );
  }

  return <PostStudio initialPost={post} initialLearningPlacement={learningPlacement} />;
}
