export interface PostEntity {
  id: string;
  authorId: string;
  contentType: 'SERIES' | 'COMMUNITY' | 'NEWS';
  title: string;
  slug: string;
  body: string | null;
  coverMediaId: string | null;
  categoryId: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';
  moderationStatus?: 'UNREVIEWED' | 'APPROVED' | 'BANNED';
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  moderationReason?: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';
  sourceUrl?: string | null;
  sourceName?: string | null;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePostDto {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY' | 'NEWS';
  body?: string;
  categoryId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  status: 'DRAFT' | 'PUBLISHED';
  metaTitle?: string;
  metaDescription?: string;
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';
  sourceUrl?: string;
  sourceName?: string;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  categoryId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';
  metaTitle?: string;
  metaDescription?: string;
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';
  sourceUrl?: string;
  sourceName?: string;
}

export interface PostMediaItem {
  id: string;
  secureUrl: string;
  purpose: string;
  sortOrder: number;
}

export interface PostTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface PostDetailResponse extends PostEntity {
  tags: PostTagItem[];
  media: PostMediaItem[];
}

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: 'SERIES' | 'COMMUNITY' | 'NEWS';
  icon: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TagEntity {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface PostsFeedParams {
  contentType?: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'ASC' | 'DESC';
}
