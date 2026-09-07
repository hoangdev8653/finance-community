import Image from 'next/image';
import { PostDetailResponse } from '@/types/content';
import { optimizeCloudinaryUrl, resolveMediaUrl } from '@/lib/utils/media';

interface PostCoverMediaProps {
  post: PostDetailResponse;
  priority?: boolean;
}

export function PostCoverMedia({ post, priority = true }: PostCoverMediaProps) {
  // 1. Check coverMediaId match
  let coverMedia = post.coverMediaId
    ? post.media.find((m) => m.id === post.coverMediaId)
    : undefined;

  // 2. Check purpose === 'cover'
  if (!coverMedia) {
    coverMedia = post.media.find((m) => m.purpose === 'cover');
  }

  // 3. Fallback to first available media item
  if (!coverMedia && post.media.length > 0) {
    coverMedia = post.media[0];
  }

  const resolvedUrl = coverMedia?.secureUrl
    ? optimizeCloudinaryUrl(coverMedia.secureUrl, 1200)
    : (post.coverMediaId ? resolveMediaUrl(post.coverMediaId, undefined) : null);

  if (!resolvedUrl) {
    return null;
  }

  return (
    <div className="relative my-6 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-muted shadow-[0_12px_32px_rgba(15,23,42,0.10)] sm:aspect-21/9 dark:border-slate-800">
      <Image
        src={resolvedUrl}
        alt={post.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
        className="object-cover"
      />
    </div>
  );
}
