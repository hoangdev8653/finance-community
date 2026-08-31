import { AuthGuard } from '@/components/auth/AuthGuard';
import { PostStudio } from '@/components/studio/PostStudio';

export default function CreateLearningPage() {
  return <AuthGuard><PostStudio defaultContentType="SERIES" /></AuthGuard>;
}
