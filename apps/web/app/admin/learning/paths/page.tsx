import { AuthGuard } from '@/components/auth/AuthGuard';
import { LearningPathsManager } from '@/components/admin/LearningPathsManager';

export default function AdminLearningPathsPage() {
  return <AuthGuard><LearningPathsManager /></AuthGuard>;
}
