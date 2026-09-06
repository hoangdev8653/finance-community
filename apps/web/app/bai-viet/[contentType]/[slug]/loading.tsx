import { PostDetailSkeleton } from '@/components/content/PostDetailSkeleton';

export default function PostDetailLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
      <PostDetailSkeleton />
    </div>
  );
}
