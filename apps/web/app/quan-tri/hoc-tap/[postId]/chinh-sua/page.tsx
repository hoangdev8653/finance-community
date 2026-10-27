import { LearningPostEditorPage } from '@/components/admin/LearningPostEditorPage';

export default async function EditLearningPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <LearningPostEditorPage postId={postId} />;
}
