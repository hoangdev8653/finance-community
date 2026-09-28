import Image from "next/image";
import { PostDetailResponse } from "@/types/content";
import { optimizeCloudinaryUrl, resolveMediaUrl } from "@/lib/utils/media";

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
    coverMedia = post.media.find((m) => m.purpose === "cover");
  }

  // 3. Fallback to first available media item
  if (!coverMedia && post.media.length > 0) {
    coverMedia = post.media[0];
  }

  const resolvedUrl = coverMedia?.secureUrl
    ? optimizeCloudinaryUrl(coverMedia.secureUrl, 1200)
    : post.coverMediaId
      ? resolveMediaUrl(post.coverMediaId, undefined)
      : null;

  const source =
    resolvedUrl ||
    (post.contentType === "SERIES" ? "/images/courses-hero-banner.png" : null);
  if (!source) return null;

  return (
    <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg border border-slate-100 bg-muted shadow-sm sm:aspect-21/9 dark:border-slate-800">
      <Image
        src={source}
        alt={post.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
        className="object-cover"
      />
    </div>
  );
}
