import { notFound } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';
import { postsService } from '@/lib/posts/posts-service';

export default async function EditLearningPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  try { const post = await postsService.getById(postId); return <AuthGuard><PostStudio initialPost={post} /></AuthGuard>; }
  catch { notFound(); }
}
