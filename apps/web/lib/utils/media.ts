const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';

const MEDIA_URL_MAP: Record<string, string> = {
  // Seed Database Media UUIDs
  '00000000-0000-4000-8000-000000000021': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000022': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000023': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000024': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000025': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000026': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000027': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000028': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-000000000029': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-00000000002a': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80',
  '00000000-0000-4000-8000-00000000002b': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80',
};

/**
 * Safely resolves any media ID or URL string into a valid Image URL
 */
export function resolveMediaUrl(mediaIdOrUrl?: string | null, fallback = DEFAULT_COVER_IMAGE): string {
  if (!mediaIdOrUrl) return fallback;
  if (mediaIdOrUrl.startsWith('http://') || mediaIdOrUrl.startsWith('https://') || mediaIdOrUrl.startsWith('/')) {
    return mediaIdOrUrl;
  }
  return MEDIA_URL_MAP[mediaIdOrUrl] || fallback;
}
