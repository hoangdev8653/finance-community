import { PostsFeedParams } from '@/types/content';
import { QueryReportsParams } from '@/types/moderation';
import { QueryAuditLogsParams } from '@/types/admin';
import { SearchFilterState } from '@/types/search';

export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (params?: PostsFeedParams) => {
      // Normalize undefined keys so equivalent filter states share cache
      const normalizedParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
          )
        : {};
      return ['posts', 'list', normalizedParams] as const;
    },
    detail: (contentType: string, slug: string) => ['posts', 'detail', contentType, slug] as const,
    comments: (postId: string, params?: Record<string, unknown>) => ['posts', postId, 'comments', params] as const,
    reactions: (postId: string) => ['posts', postId, 'reactions'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (scope?: 'SERIES' | 'COMMUNITY') => ['categories', 'list', scope || 'ALL'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: (search?: string, limit?: number) => ['tags', 'list', { search: search || '', limit: limit || 20 }] as const,
    detail: (id: string) => ['tags', 'detail', id] as const,
    bySlug: (slug: string) => ['tags', 'bySlug', slug] as const,
  },
  series: {
    all: ['series'] as const,
    list: (params?: Record<string, unknown>) => ['series', 'list', params] as const,
    detail: (slug: string, params?: Record<string, unknown>) => ['series', 'detail', slug, params] as const,
  },
  users: {
    me: ['users', 'me'] as const,
    profile: (username: string) => ['users', 'profile', username] as const,
    followers: (userId: string) => ['users', userId, 'followers'] as const,
    following: (userId: string) => ['users', userId, 'following'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  },
  reactions: {
    all: ['reactions'] as const,
    post: (postId: string) => ['reactions', 'post', postId] as const,
    comment: (commentId: string) => ['reactions', 'comment', commentId] as const,
  },
  media: {
    all: ['media'] as const,
    detail: (id: string) => ['media', 'detail', id] as const,
  },
  reports: {
    all: ['reports'] as const,
    queue: (params?: QueryReportsParams) => ['reports', 'queue', params || {}] as const,
  },
  moderation: {
    all: ['moderation'] as const,
    actions: ['moderation', 'actions'] as const,
  },
  featureFlags: {
    public: ['featureFlags', 'public'] as const,
    admin: ['featureFlags', 'admin'] as const,
  },
  admin: {
    settings: ['admin', 'settings'] as const,
    auditLogs: (params?: QueryAuditLogsParams) => ['admin', 'auditLogs', params || {}] as const,
    comments: (params?: Record<string, unknown>) => ['admin', 'comments', params || {}] as const,
  },
  search: {
    discovery: (filters?: SearchFilterState) => ['search', 'discovery', filters || {}] as const,
    palette: (query: string) => ['search', 'palette', query] as const,
  },
} as const;
