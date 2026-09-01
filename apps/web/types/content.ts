export interface PostEntity {
  id: string;
  authorId: string;
  contentType: 'SERIES' | 'COMMUNITY';
  title: string;
  slug: string;
  body: string | null;
  coverMediaId: string | null;
  categoryId: string | null;
  domainId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';
  editorialStatus?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'NEEDS_UPDATE' | 'ARCHIVED';
  moderationStatus?: 'UNREVIEWED' | 'APPROVED' | 'BANNED';
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  moderationReason?: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';
  sourceUrl?: string | null;
  sourceName?: string | null;
  topics?: PostTopicItem[];
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePostDto {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY';
  body?: string;
  categoryId?: string;
  domainId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  topics?: string[];
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
  domainId?: string;
  coverMediaId?: string;
  tags?: string[];
  mediaIds?: string[];
  topics?: string[];
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

export interface PostTopicItem {
  id: string;
  name: string;
  slug: string;
  domainId: string;
  categoryId: string | null;
}

export interface PostDetailResponse extends PostEntity {
  tags: PostTagItem[];
  topics?: PostTopicItem[];
  media: PostMediaItem[];
}

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: 'SERIES' | 'COMMUNITY';
  icon?: string | null;
  domainId?: string | null;
  parentId?: string | null;
  nameVi?: string | null;
  nameEn?: string | null;
  contentTypes?: Array<'SERIES' | 'COMMUNITY'>;
  isActive?: boolean;
  isPromoted?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
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
  domainId?: string;
  tagId?: string;
  topicId?: string;
  authorId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

export interface DomainEntity {
  id: string;
  code: string;
  slug: string;
  name: string;
  nameVi: string | null;
  nameEn: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
}
